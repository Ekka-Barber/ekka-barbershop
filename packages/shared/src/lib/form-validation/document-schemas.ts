import { z } from 'zod';

import { TIME } from '@shared/constants/time';

import {
  documentBaseSchema,
  createDateRangeSchema,
  durationMonthsSchema,
  notificationThresholdSchema,
} from './schemas';

/**
 * Employee document form schema
 * Used for adding/editing employee documents with date validation
 */
export const employeeDocumentSchema = documentBaseSchema
  .extend({
    issue_date: z.string().min(1, 'Issue date is required'),
    expiry_date: z.string().min(1, 'Expiry date is required'),
    duration_months: durationMonthsSchema
      .optional()
      .default(TIME.MONTHS_PER_YEAR),
    notification_threshold_days: notificationThresholdSchema
      .optional()
      .default(TIME.DAYS_PER_MONTH_APPROX),
  })
  .and(createDateRangeSchema('issue_date', 'expiry_date'));

// Export types
export type EmployeeDocumentSchema = z.infer<typeof employeeDocumentSchema>;
