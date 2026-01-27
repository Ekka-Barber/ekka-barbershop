import type { EmployeeDocument } from '../types';

export interface ValidationRule {
  field: string;
  type:
    | 'required'
    | 'regex'
    | 'future_date'
    | 'past_date'
    | 'min_length'
    | 'max_length';
  message: string;
  pattern?: RegExp;
  value?: number;
}

export interface DocumentTemplateData {
  id: string;
  name: string;
  description: string;
  documentType: string;
  iconName: string;
  defaultValues: Partial<EmployeeDocument>;
  validationRules: ValidationRule[];
  requiredFields: string[];
  isActive: boolean;
  category: 'government' | 'health' | 'work' | 'custom';
}

export interface DocumentTemplate
  extends Omit<DocumentTemplateData, 'iconName'> {
  icon: React.ReactNode;
}

export interface DocumentTemplatesProps {
  onTemplateSelect: (template: DocumentTemplate) => void;
  selectedDocumentType?: string;
}

export interface TemplateCategory {
  value: string;
  label: string;
  icon: React.ReactNode;
}
