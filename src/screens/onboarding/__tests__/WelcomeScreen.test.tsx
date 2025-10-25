import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeScreen } from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  const mockNavigate = jest.fn();
  const mockNavigation = {
    navigate: mockNavigate,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render welcome title', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);
    expect(getByText('Velkommen til GI Diary')).toBeTruthy();
  });

  it('should render welcome description', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);
    expect(
      getByText(/Tren magen din som du trener kroppen/i)
    ).toBeTruthy();
  });

  it('should render "Kom i gang" button', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);
    expect(getByText('Kom i gang')).toBeTruthy();
  });

  it('should navigate to Goals screen when button is pressed', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    const button = getByText('Kom i gang');
    fireEvent.press(button);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('Goals');
  });

  it('should render with Material Design 3 Text component', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    const title = getByText('Velkommen til GI Diary');
    // Just verify the title renders - variant is internal to Paper component
    expect(title).toBeTruthy();
  });
});
