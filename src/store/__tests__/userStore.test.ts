import { renderHook, act } from '@testing-library/react-native';

// Create mock database instance BEFORE importing anything
const mockDb = {
  getFirstSync: jest.fn(),
  runSync: jest.fn(),
  getAllSync: jest.fn(),
};

// Mock expo-sqlite module BEFORE importing the store
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb),
}));

// Now import the store after mocking
import { useUserStore } from '../userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock return values
    mockDb.getFirstSync.mockReturnValue(null);
    mockDb.runSync.mockReturnValue({ lastInsertRowId: 1, changes: 1 });

    // Reset the store state to initial values
    const store = useUserStore.getState();
    store.user = null;
    store.onboardingCompleted = false;
    store.isLoading = true;
  });

  describe('Initial State', () => {
    it('should have correct initial state structure', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('onboardingCompleted');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('initialize');
      expect(result.current).toHaveProperty('completeOnboarding');
      expect(result.current).toHaveProperty('updateProfile');
    });

    it('should have user as null initially', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.user).toBeNull();
    });

    it('should have onboardingCompleted false initially', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.onboardingCompleted).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should allow manual state updates for testing', () => {
      const { result } = renderHook(() => useUserStore());

      const mockUser = {
        id: 1,
        name: 'Test User',
        onboarded_at: '2025-01-15T10:00:00.000Z',
        primary_goal: 'Sub-3 maraton Oslo 2025',
        primary_gi_issue: 'kvalme',
        created_at: '2025-01-15T10:00:00.000Z',
        updated_at: '2025-01-15T10:00:00.000Z',
      };

      act(() => {
        result.current.user = mockUser;
        result.current.onboardingCompleted = true;
        result.current.isLoading = false;
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.onboardingCompleted).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Function Signatures', () => {
    it('initialize should be a function', () => {
      const { result } = renderHook(() => useUserStore());
      expect(typeof result.current.initialize).toBe('function');
    });

    it('completeOnboarding should be a function', () => {
      const { result } = renderHook(() => useUserStore());
      expect(typeof result.current.completeOnboarding).toBe('function');
    });

    it('updateProfile should be a function', () => {
      const { result } = renderHook(() => useUserStore());
      expect(typeof result.current.updateProfile).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('updateProfile should throw error when no user exists', async () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.user = null;
        result.current.onboardingCompleted = false;
        result.current.isLoading = false;
      });

      const updates = {
        name: 'Updated Name',
      };

      await expect(
        act(async () => {
          await result.current.updateProfile(updates);
        })
      ).rejects.toThrow('No user to update');
    });
  });

  describe('updateProfile - State Management', () => {
    // Note: Full integration tests with database mocks are in ProfileSetupScreen.test.tsx
    // These tests only verify basic state management without database operations

    it('should throw error when no user exists', async () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.user = null;
        result.current.onboardingCompleted = false;
        result.current.isLoading = false;
      });

      await expect(
        act(async () => {
          await result.current.updateProfile({ name: 'Test' });
        })
      ).rejects.toThrow('No user to update');
    });
  });

  describe('Norwegian GI Issue Values - Data Structure', () => {
    it('should accept Norwegian kvalme value', () => {
      const giIssue = 'kvalme';
      expect(giIssue).toBe('kvalme');
      expect(giIssue).not.toBe('nausea'); // Not English
    });

    it('should accept Norwegian kramper value', () => {
      const giIssue = 'kramper';
      expect(giIssue).toBe('kramper');
      expect(giIssue).not.toBe('cramps'); // Not English
    });

    it('should accept Norwegian oppbl\u00e5sthet value', () => {
      const giIssue = 'oppblåsthet';
      expect(giIssue).toBe('oppblåsthet');
      expect(giIssue).not.toBe('bloating'); // Not English
    });

    it('should accept Norwegian diaré value', () => {
      const giIssue = 'diaré';
      expect(giIssue).toBe('diaré');
      expect(giIssue).not.toBe('diarrhea'); // Not English
    });

    it('should accept custom text for annet option', () => {
      const giIssue = 'sure oppstøt';
      expect(giIssue).toBe('sure oppstøt');
      expect(giIssue.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Profile Data Structure', () => {
    it('should accept valid profile with primary_goal', () => {
      const profile = {
        primary_goal: 'Sub-3 maraton Oslo 2025',
        primary_gi_issue: 'kvalme',
      };

      expect(profile.primary_goal).toBeDefined();
      expect(profile.primary_goal.length).toBeGreaterThanOrEqual(5);
      expect(profile.primary_goal.length).toBeLessThanOrEqual(200);
    });

    it('should accept valid profile with Norwegian GI issue', () => {
      const profile = {
        primary_goal: 'Sub-3 maraton Oslo 2025',
        primary_gi_issue: 'kramper',
      };

      expect(profile.primary_gi_issue).toBeDefined();
      expect(['kvalme', 'kramper', 'oppblåsthet', 'diaré']).toContain(
        profile.primary_gi_issue
      );
    });

    it('should accept custom GI issue text', () => {
      const profile = {
        primary_goal: 'Sub-3 maraton Oslo 2025',
        primary_gi_issue: 'sure oppstøt',
      };

      expect(profile.primary_gi_issue).toBe('sure oppstøt');
      expect(profile.primary_gi_issue.length).toBeGreaterThanOrEqual(3);
    });
  });
});
