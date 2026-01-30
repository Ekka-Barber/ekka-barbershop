import * as z from 'zod';

// =============================================
// COMMON FIELD SCHEMAS
// =============================================

/**
 * Common employee ID validation
 */
const employeeIdSchema = z
  .string()
  .uuid('Invalid employee selection')
  .min(1, 'Employee selection is required');

/**
 * Common date validation (ISO date string)
 */
const dateSchema = z
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
const notesSchema = z
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
const documentNameSchema = z
  .string()
  .min(1, 'Document name is required')
  .max(255, 'Document name is too long')
  .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Document name contains invalid characters');

/**
 * Document number validation (optional, alphanumeric)
 */
const documentNumberSchema = z
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
