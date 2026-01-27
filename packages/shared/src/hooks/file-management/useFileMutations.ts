
import { FilePreview } from '@shared/types/admin';

import { useDeleteFileMutation } from './mutations/useDeleteFileMutation';
import { useToggleFileMutation } from './mutations/useToggleFileMutation';
import { useUpdateEndDateMutation } from './mutations/useUpdateEndDateMutation';
import { useUploadFileMutation } from './mutations/useUploadFileMutation';
import { useFileValidation } from './useFileValidation';

export const useFileMutations = (
  setUploading: (value: boolean) => void,
  setFilePreview: (value: FilePreview | null) => void,
  resetUploadState: () => void
) => {
  const { validateFile, generatePreview } = useFileValidation();
  
  const uploadMutation = useUploadFileMutation(
    setUploading,
    setFilePreview,
    resetUploadState,
    validateFile,
    generatePreview
  );
  
  const deleteMutation = useDeleteFileMutation();
  const toggleActiveMutation = useToggleFileMutation();
  const updateEndDateMutation = useUpdateEndDateMutation();

  return {
    uploadMutation,
    deleteMutation,
    toggleActiveMutation,
    updateEndDateMutation
  };
};
