import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { GIIssueScreen } from '../GIIssueScreen';

describe('GIIssueScreen', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  const mockNavigation = {
    navigate: mockNavigate,
    goBack: mockGoBack,
  } as any;

  const mockRoute = {
    params: {
      goal: 'Sub-3 maraton Oslo 2025',
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render screen title', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );
      expect(getByText('Hva er din største mageutfordring?')).toBeTruthy();
    });

    it('should render all 5 GI issue options', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Kvalme')).toBeTruthy();
      expect(getByText('Kramper')).toBeTruthy();
      expect(getByText('Oppblåsthet')).toBeTruthy();
      expect(getByText('Diaré')).toBeTruthy();
      expect(getByText('Annet')).toBeTruthy();
    });

    it('should render "Fullfør" and "Tilbake" buttons', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );
      expect(getByText('Fullfør')).toBeTruthy();
      expect(getByText('Tilbake')).toBeTruthy();
    });
  });

  describe('GI Issue Selection', () => {
    it('should not navigate when no issue is selected and button pressed', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate when a standard issue is selected', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const kvalmeOption = getByText('Kvalme');
      fireEvent.press(kvalmeOption);

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('ProgramSuggestion', {
        goal: 'Sub-3 maraton Oslo 2025',
        giIssue: 'kvalme',
      });
    });

    it('should show text input when "Annet" is selected', () => {
      const { getByText, getByPlaceholderText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const annetOption = getByText('Annet');
      fireEvent.press(annetOption);

      expect(getByPlaceholderText('f.eks. sure oppstøt')).toBeTruthy();
    });

    it('should hide text input when switching away from "Annet"', () => {
      const { getByText, queryByPlaceholderText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Select "Annet" first
      const annetOption = getByText('Annet');
      fireEvent.press(annetOption);

      expect(queryByPlaceholderText('f.eks. sure oppstøt')).toBeTruthy();

      // Switch to "Kvalme"
      const kvalmeOption = getByText('Kvalme');
      fireEvent.press(kvalmeOption);

      expect(queryByPlaceholderText('f.eks. sure oppstøt')).toBeNull();
    });
  });

  describe('"Annet" Validation', () => {
    it('should not navigate when "Annet" is selected without text', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const annetOption = getByText('Annet');
      fireEvent.press(annetOption);

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when "Annet" text is less than 3 characters', () => {
      const { getByText, getByPlaceholderText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const annetOption = getByText('Annet');
      fireEvent.press(annetOption);

      const input = getByPlaceholderText('f.eks. sure oppstøt');
      fireEvent.changeText(input, 'ab'); // 2 characters

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate when "Annet" text is 3+ characters', () => {
      const { getByText, getByPlaceholderText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const annetOption = getByText('Annet');
      fireEvent.press(annetOption);

      const input = getByPlaceholderText('f.eks. sure oppstøt');
      fireEvent.changeText(input, 'sure oppstøt'); // Valid text

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('ProgramSuggestion', {
        goal: expect.any(String),
        giIssue: 'sure oppstøt',
      });
    });
  });

  describe('Navigation to ProgramSuggestion', () => {
    it('should navigate to ProgramSuggestion with goal and GI issue (Norwegian value)', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const kvalmeOption = getByText('Kvalme');
      fireEvent.press(kvalmeOption);

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('ProgramSuggestion', {
        goal: 'Sub-3 maraton Oslo 2025',
        giIssue: 'kvalme', // Norwegian value, not English
      });
    });

    it('should navigate to ProgramSuggestion with custom "Annet" text', () => {
      const { getByText, getByPlaceholderText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const annetOption = getByText('Annet');
      fireEvent.press(annetOption);

      const input = getByPlaceholderText('f.eks. sure oppstøt');
      fireEvent.changeText(input, 'sure oppstøt');

      const button = getByText('Fullfør');
      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('ProgramSuggestion', {
        goal: 'Sub-3 maraton Oslo 2025',
        giIssue: 'sure oppstøt', // Custom text
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when "Tilbake" is pressed', () => {
      const { getByText } = render(
        <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
      );

      const backButton = getByText('Tilbake');
      fireEvent.press(backButton);

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Norwegian GI Issue Values', () => {
    it.each([
      ['Kvalme', 'kvalme'],
      ['Kramper', 'kramper'],
      ['Oppblåsthet', 'oppblåsthet'],
      ['Diaré', 'diaré'],
    ])(
      'should navigate with "%s" as "%s" (Norwegian value)',
      (label, expectedValue) => {
        const { getByText } = render(
          <GIIssueScreen navigation={mockNavigation} route={mockRoute} />
        );

        const option = getByText(label);
        fireEvent.press(option);

        const button = getByText('Fullfør');
        fireEvent.press(button);

        expect(mockNavigate).toHaveBeenCalledWith('ProgramSuggestion', {
          goal: expect.any(String),
          giIssue: expectedValue,
        });
      }
    );
  });
});
