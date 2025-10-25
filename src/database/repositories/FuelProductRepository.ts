/**
 * Fuel Product Repository
 *
 * Handles CRUD operations for fuel products (gels, drinks, bars, food).
 * Implements soft delete pattern (deleted_at field).
 */

import { getDatabase } from '../index';

export interface FuelProduct {
  id: number;
  user_id: number;
  name: string;
  product_type: 'gel' | 'drink' | 'bar' | 'food';
  carbs_per_serving: number;
  serving_size?: string;
  notes?: string;
  created_at: string;
  deleted_at?: string;
}

export interface CreateFuelProductInput {
  name: string;
  product_type: 'gel' | 'drink' | 'bar' | 'food';
  carbs_per_serving: number;
  serving_size?: string;
  notes?: string;
  user_id?: number; // Defaults to 1 for MVP
}

export interface UpdateFuelProductInput {
  name?: string;
  product_type?: 'gel' | 'drink' | 'bar' | 'food';
  carbs_per_serving?: number;
  serving_size?: string;
  notes?: string;
}

export class FuelProductRepository {
  /**
   * Get all active fuel products for a user
   * @param userId User ID (defaults to 1 for MVP)
   * @returns Array of active fuel products
   */
  static async getAll(userId: number = 1): Promise<FuelProduct[]> {
    try {
      const db = await getDatabase();
      const products = await db.getAllAsync<FuelProduct>(
        `SELECT * FROM fuel_products
         WHERE user_id = ? AND deleted_at IS NULL
         ORDER BY name ASC`,
        [userId]
      );
      return products || [];
    } catch (error) {
      console.error('FuelProductRepository.getAll failed:', error);
      throw error;
    }
  }

  /**
   * Get a single fuel product by ID
   * @param id Product ID
   * @returns Fuel product or null if not found
   */
  static async getById(id: number): Promise<FuelProduct | null> {
    try {
      const db = await getDatabase();
      const product = await db.getFirstAsync<FuelProduct>(
        `SELECT * FROM fuel_products WHERE id = ?`,
        [id]
      );
      return product || null;
    } catch (error) {
      console.error('FuelProductRepository.getById failed:', error);
      throw error;
    }
  }

  /**
   * Create a new fuel product
   * @param input Product data
   * @returns ID of created product
   */
  static async create(input: CreateFuelProductInput): Promise<number> {
    try {
      const db = await getDatabase();
      const userId = input.user_id || 1;

      const result = await db.runAsync(
        `INSERT INTO fuel_products (user_id, name, product_type, carbs_per_serving, serving_size, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          input.name,
          input.product_type,
          input.carbs_per_serving,
          input.serving_size || null,
          input.notes || null,
        ]
      );

      return result.lastInsertRowId;
    } catch (error) {
      console.error('FuelProductRepository.create failed:', error);
      throw error;
    }
  }

  /**
   * Update an existing fuel product
   * @param id Product ID
   * @param updates Fields to update
   * @returns True if successful
   */
  static async update(id: number, updates: UpdateFuelProductInput): Promise<boolean> {
    try {
      const db = await getDatabase();

      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.product_type !== undefined) {
        fields.push('product_type = ?');
        values.push(updates.product_type);
      }
      if (updates.carbs_per_serving !== undefined) {
        fields.push('carbs_per_serving = ?');
        values.push(updates.carbs_per_serving);
      }
      if (updates.serving_size !== undefined) {
        fields.push('serving_size = ?');
        values.push(updates.serving_size);
      }
      if (updates.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updates.notes);
      }

      if (fields.length === 0) {
        return false; // No updates
      }

      values.push(id);

      const result = await db.runAsync(
        `UPDATE fuel_products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.changes > 0;
    } catch (error) {
      console.error('FuelProductRepository.update failed:', error);
      throw error;
    }
  }

  /**
   * Soft delete a fuel product
   * @param id Product ID
   * @returns True if successful
   */
  static async softDelete(id: number): Promise<boolean> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `UPDATE fuel_products SET deleted_at = datetime('now') WHERE id = ?`,
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('FuelProductRepository.softDelete failed:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a fuel product (hard delete)
   * @param id Product ID
   * @returns True if successful
   */
  static async hardDelete(id: number): Promise<boolean> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `DELETE FROM fuel_products WHERE id = ?`,
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('FuelProductRepository.hardDelete failed:', error);
      throw error;
    }
  }
}
