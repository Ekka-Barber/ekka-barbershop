import { Shield, Heart, Briefcase, FileIcon, FileText } from 'lucide-react';

import { DOCUMENT_TEMPLATE_DATA } from '../templates/template-definitions';
import type {
  DocumentTemplate,
  DocumentTemplateData,
  TemplateCategory,
} from '../templates/types';

/**
 * Create a React icon element from icon name string
 */
export const createIconFromName = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'Heart':
      return <Heart className="h-4 w-4" />;
    case 'Shield':
      return <Shield className="h-4 w-4" />;
    case 'Briefcase':
      return <Briefcase className="h-4 w-4" />;
    case 'FileIcon':
      return <FileIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

/**
 * Convert DocumentTemplateData to DocumentTemplate with React icon
 */
export const createDocumentTemplate = (
  data: DocumentTemplateData
): DocumentTemplate => {
  return {
    ...data,
    icon: createIconFromName(data.iconName),
  };
};

/**
 * Get the appropriate icon for a template category
 */
export const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'government':
      return <Shield className="h-4 w-4" />;
    case 'health':
      return <Heart className="h-4 w-4" />;
    case 'work':
      return <Briefcase className="h-4 w-4" />;
    case 'custom':
      return <FileIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

/**
 * Get the color class for a template category
 */
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'government':
      return 'bg-info/15 text-info';
    case 'health':
      return 'bg-success/15 text-success';
    case 'work':
      return 'bg-primary/15 text-primary';
    case 'custom':
      return 'bg-muted/60 text-muted-foreground';
    default:
      return 'bg-muted/60 text-muted-foreground';
  }
};

/**
 * Available template categories for filtering
 */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    value: 'all',
    label: 'All Categories',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    value: 'government',
    label: 'Government',
    icon: <Shield className="h-4 w-4" />,
  },
  { value: 'health', label: 'Health', icon: <Heart className="h-4 w-4" /> },
  { value: 'work', label: 'Work', icon: <Briefcase className="h-4 w-4" /> },
  {
    value: 'custom',
    label: 'Custom',
    icon: <FileIcon className="h-4 w-4" />,
  },
];

/**
 * Get all document templates as DocumentTemplate objects
 */
export const getDocumentTemplates = (): DocumentTemplate[] => {
  return DOCUMENT_TEMPLATE_DATA.map(createDocumentTemplate);
};

/**
 * Filter templates based on document type and category
 */
export const filterTemplates = (
  templates: DocumentTemplate[],
  selectedDocumentType?: string,
  selectedCategory?: string
): DocumentTemplate[] => {
  return templates.filter((template) => {
    if (!template.isActive) return false;
    if (selectedDocumentType && template.documentType !== selectedDocumentType)
      return false;
    if (
      selectedCategory &&
      selectedCategory !== 'all' &&
      template.category !== selectedCategory
    )
      return false;
    return true;
  });
};

/**
 * Get templates count by category
 */
export const getTemplatesCountByCategory = (
  templates: DocumentTemplate[]
): Record<string, number> => {
  return templates.reduce(
    (acc, template) => {
      if (template.isActive) {
        acc[template.category] = (acc[template.category] || 0) + 1;
        acc.all = (acc.all || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );
};