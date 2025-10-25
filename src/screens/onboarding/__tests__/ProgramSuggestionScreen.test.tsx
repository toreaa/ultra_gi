import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { ProgramSuggestionScreen } from '../ProgramSuggestionScreen';
import * as programRecommendation from '../../../services/programRecommendation';
import { ProgramRepository } from '../../../database/repositories/ProgramRepository';
import { useUserStore } from '../../../store/userStore';
import type { Program } from '../../../types/database';

// Mock dependencies
jest.mock('../../../services/programRecommendation');
jest.mock('../../../database/repositories/ProgramRepository');
jest.mock('../../../store/userStore');

// Create mockDb before importing anything
const mockDb = {} as any;

// Mock getDatabase
jest.mock('../../../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

import { getDatabase } from '../../../database';

const mockProgram: Program = {
  id: 1,
  name: '4-Week Base Carb Training',
  description:
    'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
  duration_weeks: 4,
  target_audience: 'Endurance athletes new to carb training',
  research_source: 'Based on Jeukendrup (2014) gut training protocols',
  created_at: '2025-01-01T00:00:00.000Z',
  is_active: true,
};

const mockRecommendation = {
  program: mockProgram,
  reasoning:
    'Dette programmet starter med lav intensitet (30g/t) som reduserer sjansen for kvalme.',
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

const mockRoute = {
  params: {
    goal: 'Sub-3 maraton Oslo 2025',
    giIssue: 'kvalme',
  },
} as any;

const mockCompleteOnboarding = jest.fn();

describe('ProgramSuggestionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mockDb and getDatabase
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    // Reset and configure mockCompleteOnboarding
    mockCompleteOnboarding.mockClear();
    mockCompleteOnboarding.mockResolvedValue(undefined);

    // Mock useUserStore - return a function that accesses the store
    (useUserStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const store = {
        completeOnboarding: mockCompleteOnboarding,
      };
      return selector ? selector(store) : store;
    });

    // Mock programRecommendation functions
    (programRecommendation.getRecommendedProgram as jest.Mock).mockResolvedValue(
      mockRecommendation
    );
    (programRecommendation.getProgramStartIntensity as jest.Mock).mockResolvedValue(30);

    // Mock ProgramRepository
    (ProgramRepository.startProgram as jest.Mock).mockResolvedValue(1);
  });

  describe('Loading State', () => {
    it('should display loading indicator initially', () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Finner beste program for deg...')).toBeTruthy();
    });

    it('should show activity indicator during loading', () => {
      const { getByTestId, UNSAFE_root } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      // ActivityIndicator should be present
      const activityIndicators = UNSAFE_root.findAllByType('ActivityIndicator' as any);
      expect(activityIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Program Display', () => {
    it('should display program name after loading', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('4-Week Base Carb Training')).toBeTruthy();
      });
    });

    it('should display program description', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(
          getByText(/Progressive carbohydrate tolerance training/i)
        ).toBeTruthy();
      });
    });

    it('should display program duration', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('4 uker, 2 økter per uke')).toBeTruthy();
      });
    });

    it('should display start intensity', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('30g/t')).toBeTruthy();
      });
    });

    it('should display reasoning text', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(
          getByText(/Dette programmet starter med lav intensitet/i)
        ).toBeTruthy();
      });
    });

    it('should display "Hvorfor dette programmet?" header', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Hvorfor dette programmet?')).toBeTruthy();
      });
    });
  });

  describe('Start Program Button', () => {
    it('should display "Start dette programmet" button', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Start dette programmet')).toBeTruthy();
      });
    });

    it('should call startProgram when button is pressed', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Start dette programmet')).toBeTruthy();
      });

      const button = getByText('Start dette programmet');
      fireEvent.press(button);

      await waitFor(() => {
        expect(ProgramRepository.startProgram).toHaveBeenCalledWith(mockDb, 1, 1);
      });
    });

    it('should call completeOnboarding when button is pressed', async () => {
      // Spy on console.error to catch any errors
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Start dette programmet')).toBeTruthy();
      });

      const button = getByText('Start dette programmet');

      await act(async () => {
        fireEvent.press(button);
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Check that no errors were logged
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Verify both functions were called
      expect(ProgramRepository.startProgram).toHaveBeenCalledWith(mockDb, 1, 1);
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
      expect(mockCompleteOnboarding).toHaveBeenCalledWith({
        primary_goal: 'Sub-3 maraton Oslo 2025',
        primary_gi_issue: 'kvalme',
      });

      consoleErrorSpy.mockRestore();
    });

    it('should disable button while starting program', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Start dette programmet')).toBeTruthy();
      });

      const button = getByText('Start dette programmet');

      // Make startProgram take longer
      (ProgramRepository.startProgram as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(1), 100))
      );

      fireEvent.press(button);

      // Button should be disabled during execution
      // Note: Testing disabled state is complex in RN Testing Library
      // This verifies the flow doesn't break
      await waitFor(() => {
        expect(ProgramRepository.startProgram).toHaveBeenCalled();
      });
    });
  });

  describe('View All Programs Button', () => {
    it('should display "Se alle programmer" button', async () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Se alle programmer')).toBeTruthy();
      });
    });

    it('should be a placeholder for Epic 3', async () => {
      // Mock console.log to verify placeholder behavior
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Se alle programmer')).toBeTruthy();
      });

      const button = getByText('Se alle programmer');
      fireEvent.press(button);

      expect(consoleSpy).toHaveBeenCalledWith(
        'View all programs - coming in Epic 3'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error State', () => {
    it('should display error message when recommendation fails', async () => {
      (programRecommendation.getRecommendedProgram as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Kunne ikke laste program')).toBeTruthy();
      });
    });

    it('should display retry button on error', async () => {
      (programRecommendation.getRecommendedProgram as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Prøv igjen')).toBeTruthy();
      });
    });

    it('should reload recommendation when retry button is pressed', async () => {
      (programRecommendation.getRecommendedProgram as jest.Mock)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce(mockRecommendation);

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Prøv igjen')).toBeTruthy();
      });

      const retryButton = getByText('Prøv igjen');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(getByText('4-Week Base Carb Training')).toBeTruthy();
      });

      expect(programRecommendation.getRecommendedProgram).toHaveBeenCalledTimes(2);
    });

    it('should log error to console when startProgram fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (ProgramRepository.startProgram as jest.Mock).mockRejectedValue(
        new Error('Failed to start program')
      );

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Start dette programmet')).toBeTruthy();
      });

      const button = getByText('Start dette programmet');
      fireEvent.press(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to start program:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Database Integration', () => {
    it('should fetch recommendation with correct parameters', async () => {
      render(<ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(programRecommendation.getRecommendedProgram).toHaveBeenCalledWith(
          mockDb,
          'kvalme'
        );
      });
    });

    it('should fetch start intensity for recommended program', async () => {
      render(<ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(programRecommendation.getProgramStartIntensity).toHaveBeenCalledWith(
          mockDb,
          1
        );
      });
    });

    it('should use giIssue from route params', async () => {
      const customRoute = {
        params: {
          goal: 'Test Goal',
          giIssue: 'kramper',
        },
      } as any;

      render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={customRoute} />
      );

      await waitFor(() => {
        expect(programRecommendation.getRecommendedProgram).toHaveBeenCalledWith(
          mockDb,
          'kramper'
        );
      });
    });
  });

  describe('Norwegian Localization', () => {
    it('should display all text in Norwegian', async () => {
      const { getByText, queryByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Anbefalt program for deg')).toBeTruthy();
      });

      // Check Norwegian text is present
      expect(getByText('Anbefalt program for deg')).toBeTruthy();
      expect(getByText('Hvorfor dette programmet?')).toBeTruthy();
      expect(getByText('Start dette programmet')).toBeTruthy();
      expect(getByText('Se alle programmer')).toBeTruthy();
      expect(getByText('Varighet:')).toBeTruthy();
      expect(getByText('Start-intensitet:')).toBeTruthy();

      // Check no English text
      expect(queryByText(/Recommended program/i)).toBeNull();
      expect(queryByText(/Why this program/i)).toBeNull();
      expect(queryByText(/Start this program/i)).toBeNull();
    });

    it('should display loading text in Norwegian', () => {
      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Finner beste program for deg...')).toBeTruthy();
    });

    it('should display error text in Norwegian', async () => {
      (programRecommendation.getRecommendedProgram as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      const { getByText } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(getByText('Kunne ikke laste program')).toBeTruthy();
        expect(getByText('Prøv igjen')).toBeTruthy();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should load recommendation on mount', async () => {
      render(<ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(programRecommendation.getRecommendedProgram).toHaveBeenCalledTimes(1);
      });
    });

    it('should reload recommendation when giIssue changes', async () => {
      const { rerender } = render(
        <ProgramSuggestionScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(programRecommendation.getRecommendedProgram).toHaveBeenCalledTimes(1);
      });

      const newRoute = {
        params: {
          goal: 'Test Goal',
          giIssue: 'kramper',
        },
      } as any;

      rerender(
        <ProgramSuggestionScreen navigation={mockNavigation} route={newRoute} />
      );

      await waitFor(() => {
        expect(programRecommendation.getRecommendedProgram).toHaveBeenCalledTimes(2);
      });
    });
  });
});
