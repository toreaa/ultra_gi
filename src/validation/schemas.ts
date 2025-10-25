/**
 * Validation schemas using Zod
 * Norwegian error messages for all validation rules
 */

import { z } from 'zod';

/**
 * Fuel Product validation schema
 * Used for both creating and editing fuel products
 */
export const fuelProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Produktnavn er påkrevd')
    .max(50, 'Produktnavn kan ikke være lengre enn 50 tegn'),

  product_type: z.enum(['gel', 'drink', 'bar', 'food'], {
    errorMap: () => ({ message: 'Velg en produkttype' }),
  }),

  carbs_per_serving: z
    .number({
      required_error: 'Karbohydrater er påkrevd',
      invalid_type_error: 'Karbohydrater må være et tall',
    })
    .positive('Karbohydrater må være større enn 0')
    .max(200, 'Karbohydrater kan ikke overstige 200g'),

  serving_size: z
    .string()
    .max(50, 'Porsjonstørrelse kan ikke være lengre enn 50 tegn')
    .optional(),

  notes: z
    .string()
    .max(200, 'Notater kan ikke være lengre enn 200 tegn')
    .optional(),
});

export type FuelProductFormData = z.infer<typeof fuelProductSchema>;
