import { TIME } from '@shared/constants/time';
import { UI } from '@shared/constants/ui';

import type { DocumentTemplateData } from './types';

/**
 * Predefined document templates data for employee document management
 * Each template provides default values and validation rules for common document types
 * Icons are handled in the components to avoid JSX in data files
 */
export const DOCUMENT_TEMPLATE_DATA: DocumentTemplateData[] = [
  {
    id: 'health_cert_standard',
    name: 'Standard Health Certificate',
    description:
      'Standard health certificate for employment with 12-month validity',
    documentType: 'health_certificate',
    iconName: 'Heart',
    defaultValues: {
      document_type: 'health_certificate',
      document_name: 'Health Certificate',
      duration_months: TIME.MONTHS_PER_YEAR,
      notification_threshold_days: TIME.DAYS_PER_MONTH_APPROX,
    },
    validationRules: [
      {
        field: 'document_name',
        type: 'required',
        message: 'Document name is required',
      },
      {
        field: 'expiry_date',
        type: 'future_date',
        message: 'Expiry date must be in the future',
      },
      {
        field: 'issue_date',
        type: 'past_date',
        message: 'Issue date cannot be in the future',
      },
    ],
    requiredFields: ['document_name', 'issue_date', 'expiry_date'],
    isActive: true,
    category: 'health',
  },
  {
    id: 'health_cert_food_handler',
    name: 'Food Handler Health Certificate',
    description: 'Specialized health certificate for food service workers',
    documentType: 'health_certificate',
    iconName: 'Heart',
    defaultValues: {
      document_type: 'health_certificate',
      document_name: 'Food Handler Health Certificate',
      duration_months: 6,
      notification_threshold_days: 15,
      notes: 'Required for food service positions',
    },
    validationRules: [
      {
        field: 'document_name',
        type: 'required',
        message: 'Document name is required',
      },
      {
        field: 'expiry_date',
        type: 'future_date',
        message: 'Expiry date must be in the future',
      },
    ],
    requiredFields: ['document_name', 'issue_date', 'expiry_date'],
    isActive: true,
    category: 'health',
  },
  {
    id: 'residency_permit_standard',
    name: 'Standard Residency Permit',
    description: 'Standard residency permit with document number validation',
    documentType: 'residency_permit',
    iconName: 'Shield',
    defaultValues: {
      document_type: 'residency_permit',
      document_name: 'Residency Permit',
      duration_months: TIME.MONTHS_PER_YEAR,
      notification_threshold_days: TIME.SECONDS_PER_MINUTE,
    },
    validationRules: [
      {
        field: 'document_number',
        type: 'required',
        message: 'Permit number is required',
      },
      {
        field: 'document_number',
        type: 'regex',
        pattern: /^[0-9]{10}$/,
        message: 'Permit number must be 10 digits',
      },
      {
        field: 'expiry_date',
        type: 'future_date',
        message: 'Expiry date must be in the future',
      },
    ],
    requiredFields: [
      'document_name',
      'document_number',
      'issue_date',
      'expiry_date',
    ],
    isActive: true,
    category: 'government',
  },
  {
    id: 'work_license_general',
    name: 'General Work License',
    description: 'Standard work license for general employment',
    documentType: 'work_license',
    iconName: 'Briefcase',
    defaultValues: {
      document_type: 'work_license',
      document_name: 'Work License',
      duration_months: TIME.HOURS_PER_DAY,
      notification_threshold_days: 90,
    },
    validationRules: [
      {
        field: 'document_number',
        type: 'required',
        message: 'License number is required',
      },
      {
        field: 'document_number',
        type: 'min_length',
        value: UI.SIZE_SM,
        message: 'License number must be at least 8 characters',
      },
      {
        field: 'expiry_date',
        type: 'future_date',
        message: 'Expiry date must be in the future',
      },
    ],
    requiredFields: [
      'document_name',
      'document_number',
      'issue_date',
      'expiry_date',
    ],
    isActive: true,
    category: 'work',
  },
  {
    id: 'work_license_specialized',
    name: 'Specialized Work License',
    description: 'Work license for specialized or technical positions',
    documentType: 'work_license',
    iconName: 'Briefcase',
    defaultValues: {
      document_type: 'work_license',
      document_name: 'Specialized Work License',
      duration_months: 36,
      notification_threshold_days: 120,
      notes: 'Required for technical/specialized positions',
    },
    validationRules: [
      {
        field: 'document_number',
        type: 'required',
        message: 'License number is required',
      },
      {
        field: 'document_number',
        type: 'min_length',
        value: 10,
        message: 'Specialized license number must be at least 10 characters',
      },
      {
        field: 'expiry_date',
        type: 'future_date',
        message: 'Expiry date must be in the future',
      },
    ],
    requiredFields: [
      'document_name',
      'document_number',
      'issue_date',
      'expiry_date',
      'notes',
    ],
    isActive: true,
    category: 'work',
  },
  {
    id: 'custom_general',
    name: 'General Custom Document',
    description: 'Template for custom documents with basic validation',
    documentType: 'custom',
    iconName: 'FileIcon',
    defaultValues: {
      document_type: 'custom',
      duration_months: TIME.MONTHS_PER_YEAR,
      notification_threshold_days: TIME.DAYS_PER_MONTH_APPROX,
    },
    validationRules: [
      {
        field: 'document_name',
        type: 'required',
        message: 'Document name is required',
      },
      {
        field: 'document_name',
        type: 'min_length',
        value: 3,
        message: 'Document name must be at least 3 characters',
      },
    ],
    requiredFields: ['document_name', 'issue_date', 'expiry_date'],
    isActive: true,
    category: 'custom',
  },
];
