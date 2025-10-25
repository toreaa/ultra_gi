/**
 * useFuelProducts Hook
 *
 * React hook for managing fuel products state.
 * Fetches all active fuel products for the current user.
 */

import { useState, useEffect, useCallback } from 'react';
import { FuelProduct, FuelProductRepository } from '../database/repositories';

interface UseFuelProductsReturn {
  products: FuelProduct[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage fuel products
 * @param userId User ID (defaults to 1 for MVP)
 * @returns Products state, loading state, error, and refresh function
 */
export function useFuelProducts(userId: number = 1): UseFuelProductsReturn {
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FuelProductRepository.getAll(userId);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load fuel products:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refresh: loadProducts,
  };
}
