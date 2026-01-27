import * as z from 'zod';

import { Constants } from '@shared/lib/supabase/types';

// =============================================
// COMMON FIELD SCHEMAS
// =============================================

/**
 * Common amount validation (positive numbers with 2 decimal places)
 */
export const amountSchema = z
  .string()
  .min(1, 'Amount is required')
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'Amount must be a positive number' }
  )
  .refine(
    (val) => {
      const num = parseFloat(val);
      return Number.isFinite(num) && num <= 9999999.99;
    },
    { message: 'Amount exceeds maximum limit' }
  );

/**
 * Common description validation
 */
export const descriptionSchema = z
  .string()
  .min(1, 'Description is required')
  .max(255, 'Description is too long')
  .trim();

/**
 * Common payment method validation
 * Derived from database enum for type safety
 */
export const paymentMethodSchema = z.enum(
  Constants.public.Enums.sales_payment_method,
  {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method selected',
  }
);

/**
 * Common reference number validation (optional)
 */
export const referenceNumberSchema = z
  .string()
  .max(100, 'Reference number is too long')
  .optional()
  .or(z.literal(''));

/**
 * Common employee ID validation
 */
export const employeeIdSchema = z
  .string()
  .uuid('Invalid employee selection')
  .min(1, 'Employee selection is required');

/**
 * Common category validation
 */
export const categorySchema = z.string().min(1, 'Category is required');

/**
 * Common date validation (ISO date string)
 */
export const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    { message: 'Invalid date format' }
  );

/**
 * Common notes/comments validation
 */
export const notesSchema = z
  .string()
  .max(500, 'Notes are too long')
  .optional()
  .or(z.literal(''));

// =============================================
// SPECIALIZED SCHEMAS
// =============================================

/**
 * Document name validation (stricter for document management)
 */
export const documentNameSchema = z
  .string()
  .min(1, 'Document name is required')
  .max(255, 'Document name is too long')
  .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Document name contains invalid characters');

/**
 * Document number validation (optional, alphanumeric)
 */
export const documentNumberSchema = z
  .string()
  .max(50, 'Document number is too long')
  .regex(/^[a-zA-Z0-9\-_]*$/, 'Document number contains invalid characters')
  .optional()
  .or(z.literal(''));

/**
 * Duration in months validation
 */
export const durationMonthsSchema = z
  .number()
  .int('Duration must be a whole number')
  .min(1, 'Duration must be at least 1 month')
  .max(120, 'Duration cannot exceed 120 months');

/**
 * Notification threshold validation
 */
export const notificationThresholdSchema = z
  .number()
  .int('Threshold must be a whole number')
  .min(1, 'Threshold must be at least 1 day')
  .max(365, 'Threshold cannot exceed 365 days');

// =============================================
// COMPOSITE SCHEMAS
// =============================================

/**
 * Basic transaction fields (used across transaction forms)
 */
export const transactionBaseSchema = z.object({
  description: descriptionSchema,
  amount: amountSchema,
  category: categorySchema,
  payment_method: paymentMethodSchema,
  reference_number: referenceNumberSchema,
});

/**
 * Employee document base fields
 */
export const documentBaseSchema = z.object({
  employee_id: employeeIdSchema,
  document_type: z.string().min(1, 'Document type is required'),
  document_name: documentNameSchema,
  document_number: documentNumberSchema,
  document_url: z.string().optional().or(z.literal('')),
  notes: notesSchema,
});

/**
 * Date range validation (ensures end date is after start date)
 */
export const createDateRangeSchema = (
  startField: string = 'issue_date',
  endField: string = 'expiry_date'
) =>
  z
    .object({
      [startField]: dateSchema,
      [endField]: dateSchema,
    })
    .refine(
      (data) => {
        const startDate = new Date(
          data[startField as keyof typeof data] as string
        );
        const endDate = new Date(data[endField as keyof typeof data] as string);
        return endDate > startDate;
      },
      {
        message: `${endField.replace('_', ' ')} must be after ${startField.replace('_', ' ')}`,
        path: [endField],
      }
    );

// =============================================
// EXPORT TYPES
// =============================================

export type AmountSchema = z.infer<typeof amountSchema>;
export type DescriptionSchema = z.infer<typeof descriptionSchema>;
export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;
export type ReferenceNumberSchema = z.infer<typeof referenceNumberSchema>;
export type EmployeeIdSchema = z.infer<typeof employeeIdSchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type DateSchema = z.infer<typeof dateSchema>;
export type NotesSchema = z.infer<typeof notesSchema>;
export type TransactionBaseSchema = z.infer<typeof transactionBaseSchema>;
export type DocumentBaseSchema = z.infer<typeof documentBaseSchema>;
