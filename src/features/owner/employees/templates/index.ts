// Types
export type {
  DocumentTemplate,
  DocumentTemplateData,
  ValidationRule,
  DocumentTemplatesProps,
  TemplateCategory,
} from './types';

// Data
export { DOCUMENT_TEMPLATE_DATA } from './template-definitions';

// Utils
export {
  getDocumentTemplates,
  createDocumentTemplate,
  createIconFromName,
  getCategoryIcon,
  getCategoryColor,
  TEMPLATE_CATEGORIES,
  filterTemplates,
  getTemplatesCountByCategory,
} from '../utils/templateUtils';

// Components
export { DocumentTemplates } from './DocumentTemplates';
export { TemplateCard } from './TemplateCard';
export { TemplateDetailsDialog } from './TemplateDetailsDialog';
