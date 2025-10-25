/**
 * usePrograms Hook
 *
 * React hook for managing programs state.
 * Fetches all active programs.
 */

import { useState, useEffect, useCallback } from 'react';
import { Program } from '../types/database';
import { ProgramRepository } from '../database/repositories/ProgramRepository';

interface UseProgramsReturn {
  programs: Program[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage programs
 * @returns Programs state, loading state, error, and refresh function
 */
export function usePrograms(): UseProgramsReturn {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgramRepository.getAll();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to load programs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  return {
    programs,
    loading,
    error,
    refresh: loadPrograms,
  };
}
