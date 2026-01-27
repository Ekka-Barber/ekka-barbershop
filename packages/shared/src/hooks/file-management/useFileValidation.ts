
import { FilePreview } from '@shared/types/admin';

import { FileValidationConfig } from './types';

export const useFileValidation = () => {
  const config: FileValidationConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  };

  const validateFile = (file: File) => {
    if (file.size > config.maxSize) {
      throw new Error(`File size must be less than ${config.maxSize / (1024 * 1024)}MB`);
    }
    if (!config.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Allowed types: ${config.allowedTypes.join(', ')}`);
    }
  };

  const generatePreview = async (file: File, category: 'menu' | 'offers'): Promise<FilePreview> => {
    if (file.type.startsWith('image/')) {
      return {
        url: URL.createObjectURL(file),
        type: category,
        fileType: 'image',
        name: file.name
      };
    } else if (file.type === 'application/pdf') {
      return {
        url: URL.createObjectURL(file),
        type: category,
        fileType: 'pdf',
        name: file.name
      };
    }
    throw new Error('Unsupported file type for preview');
  };

  return {
    validateFile,
    generatePreview,
    config
  };
};
