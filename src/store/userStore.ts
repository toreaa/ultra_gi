import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import type { User } from '../types/database';

const db = SQLite.openDatabaseSync('gidiary.db');

interface UserState {
  user: User | null;
  onboardingCompleted: boolean;
  isLoading: boolean;

  // Initialize user state on app launch
  initialize: () => Promise<void>;

  // Complete onboarding flow
  completeOnboarding: (profile: {
    primary_goal: string;
    primary_gi_issue: string;
  }) => Promise<void>;

  // Update user profile
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  onboardingCompleted: false,
  isLoading: true,

  initialize: async () => {
    try {
      // Check if user exists in database
      const result = db.getFirstSync<User>(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT 1'
      );

      if (result) {
        set({
          user: result,
          onboardingCompleted: !!result.onboarded_at,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          onboardingCompleted: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to initialize user store:', error);
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (profile) => {
    try {
      const now = new Date().toISOString();

      // Insert new user record
      const result = db.runSync(
        `INSERT INTO users (name, onboarded_at, primary_goal, primary_gi_issue, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['User', now, profile.primary_goal, profile.primary_gi_issue, now, now]
      );

      const userId = result.lastInsertRowId;

      // Fetch the created user
      const user = db.getFirstSync<User>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (user) {
        set({
          user,
          onboardingCompleted: true,
        });
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) {
      throw new Error('No user to update');
    }

    try {
      const now = new Date().toISOString();

      // Build dynamic UPDATE query based on provided fields
      const fields = Object.keys(updates).filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'onboarded_at');

      if (fields.length > 0) {
        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const values = fields.map((field) => {
          const value = updates[field as keyof User];
          return value ?? null;
        });

        db.runSync(
          `UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`,
          [...values, now, user.id]
        );
      } else {
        // Even if no profile fields provided, update timestamp
        db.runSync(
          `UPDATE users SET updated_at = ? WHERE id = ?`,
          [now, user.id]
        );
      }

      // Fetch updated user
      const updatedUser = db.getFirstSync<User>(
        'SELECT * FROM users WHERE id = ?',
        [user.id]
      );

      if (updatedUser) {
        // Mark onboarding as complete when updateProfile is called
        set({ user: updatedUser, onboardingCompleted: true });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },
}));
