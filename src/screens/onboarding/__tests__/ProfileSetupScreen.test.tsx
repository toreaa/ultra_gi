import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { ProfileSetupScreen } from '../ProfileSetupScreen';
import { useUserStore } from '../../../store/userStore';

// Mock dependencies
jest.mock('../../../store/userStore');

const mockUpdateProfile = jest.fn();
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

const mockRoute = {
  params: undefined,
} as any;

describe('ProfileSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useUserStore
    (useUserStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const store = {
        updateProfile: mockUpdateProfile,
      };
      return selector ? selector(store) : store;
    });

    mockUpdateProfile.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should display title and subtitle', () => {
      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Din profil')).toBeTruthy();
      expect(getByText('Valgfritt: Hjelp oss gi deg bedre anbefalinger')).toBeTruthy();
    });

    it('should display name input field', () => {
      const { getByPlaceholderText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByPlaceholderText('f.eks. Kari')).toBeTruthy();
    });

    it('should display weight input field', () => {
      const { getByPlaceholderText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByPlaceholderText('f.eks. 65')).toBeTruthy();
    });

    it('should display Fullfør button', () => {
      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Fullfør')).toBeTruthy();
    });

    it('should display Hopp over button', () => {
      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Hopp over')).toBeTruthy();
    });
  });

  describe('Form Completion', () => {
    it('should call updateProfile with name and weight when Fullfør pressed', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const nameInput = getByPlaceholderText('f.eks. Kari');
      const weightInput = getByPlaceholderText('f.eks. 65');
      const fullforButton = getByText('Fullfør');

      fireEvent.changeText(nameInput, 'Kari');
      fireEvent.changeText(weightInput, '65');

      await act(async () => {
        fireEvent.press(fullforButton);
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Kari',
        weight_kg: 65,
      });
    });

    it('should handle only name provided', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const nameInput = getByPlaceholderText('f.eks. Kari');
      fireEvent.changeText(nameInput, 'Test User');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Test User',
        weight_kg: undefined,
      });
    });

    it('should handle only weight provided', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, '70');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: undefined,
        weight_kg: 70,
      });
    });

    it('should handle empty fields (both optional)', async () => {
      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: undefined,
        weight_kg: undefined,
      });
    });

    it('should trim whitespace from name', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const nameInput = getByPlaceholderText('f.eks. Kari');
      fireEvent.changeText(nameInput, '  Kari  ');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Kari',
        weight_kg: undefined,
      });
    });
  });

  describe('Skip Action', () => {
    it('should call updateProfile with empty object when Hopp over pressed', async () => {
      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      await act(async () => {
        fireEvent.press(getByText('Hopp over'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({});
    });

    it('should skip even if fields are filled', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const nameInput = getByPlaceholderText('f.eks. Kari');
      const weightInput = getByPlaceholderText('f.eks. 65');

      fireEvent.changeText(nameInput, 'Kari');
      fireEvent.changeText(weightInput, '65');

      await act(async () => {
        fireEvent.press(getByText('Hopp over'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should skip and not use the filled values
      expect(mockUpdateProfile).toHaveBeenCalledWith({});
    });
  });

  describe('Validation', () => {
    it('should show error when name exceeds 50 characters', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const nameInput = getByPlaceholderText('f.eks. Kari');
      const longName = 'A'.repeat(51);

      fireEvent.changeText(nameInput, longName);

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(getByText('Navn kan ikke være lengre enn 50 tegn')).toBeTruthy();
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should show error when weight is below 30', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, '25');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(getByText('Vekt må være mellom 30 og 200 kg')).toBeTruthy();
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should show error when weight is above 200', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, '250');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(getByText('Vekt må være mellom 30 og 200 kg')).toBeTruthy();
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should show error when weight is not a number', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, 'abc');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(getByText('Vekt må være mellom 30 og 200 kg')).toBeTruthy();
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should accept valid weight at boundary (30 kg)', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, '30');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: undefined,
        weight_kg: 30,
      });
    });

    it('should accept valid weight at boundary (200 kg)', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, '200');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: undefined,
        weight_kg: 200,
      });
    });
  });

  describe('Error Handling', () => {
    it('should log error when updateProfile fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdateProfile.mockRejectedValue(new Error('Database error'));

      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update profile:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log error when skip fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdateProfile.mockRejectedValue(new Error('Database error'));

      const { getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      await act(async () => {
        fireEvent.press(getByText('Hopp over'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to skip profile:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Norwegian Localization', () => {
    it('should display all text in Norwegian', () => {
      const { getByText, queryByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Norwegian text present
      expect(getByText('Din profil')).toBeTruthy();
      expect(getByText('Fullfør')).toBeTruthy();
      expect(getByText('Hopp over')).toBeTruthy();

      // No English text
      expect(queryByText(/Complete/i)).toBeNull();
      expect(queryByText(/Skip/i)).toBeNull();
      expect(queryByText(/Profile/i)).toBeNull();
    });

    it('should display validation errors in Norwegian', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileSetupScreen navigation={mockNavigation} route={mockRoute} />
      );

      const weightInput = getByPlaceholderText('f.eks. 65');
      fireEvent.changeText(weightInput, '250');

      await act(async () => {
        fireEvent.press(getByText('Fullfør'));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(getByText(/mellom 30 og 200 kg/i)).toBeTruthy();
    });
  });
});
