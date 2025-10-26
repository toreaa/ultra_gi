/**
 * usePausedPrograms Hook
 *
 * React hook for managing user's paused programs state.
 * Fetches all paused programs for the current user.
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProgram } from '../types/database';
import { ProgramRepository } from '../database/repositories/ProgramRepository';

interface UsePausedProgramsReturn {
  pausedPrograms: UserProgram[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage user's paused programs
 * @param userId User ID (defaults to 1 for MVP)
 * @returns Paused programs state, loading state, error, and refresh function
 */
export function usePausedPrograms(userId: number = 1): UsePausedProgramsReturn {
  const [pausedPrograms, setPausedPrograms] = useState<UserProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPausedPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgramRepository.getUserPausedPrograms(userId);
      setPausedPrograms(data);
    } catch (err) {
      console.error('Failed to load paused programs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPausedPrograms();
  }, [loadPausedPrograms]);

  return {
    pausedPrograms,
    loading,
    error,
    refresh: loadPausedPrograms,
  };
}
