/**
 * useUserPrograms Hook
 *
 * React hook for managing user's active programs state.
 * Fetches all active programs for the current user.
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProgram } from '../types/database';
import { ProgramRepository } from '../database/repositories/ProgramRepository';

interface UseUserProgramsReturn {
  userPrograms: UserProgram[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage user's active programs
 * @param userId User ID (defaults to 1 for MVP)
 * @returns User programs state, loading state, error, and refresh function
 */
export function useUserPrograms(userId: number = 1): UseUserProgramsReturn {
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUserPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgramRepository.getUserActivePrograms(userId);
      setUserPrograms(data);
    } catch (err) {
      console.error('Failed to load user programs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserPrograms();
  }, [loadUserPrograms]);

  return {
    userPrograms,
    loading,
    error,
    refresh: loadUserPrograms,
  };
}
