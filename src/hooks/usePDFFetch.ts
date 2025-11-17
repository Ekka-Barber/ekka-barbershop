// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/types/language";

export interface PDFFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  is_active: boolean;
  created_at: string;
  url: string;
  branchName?: string;
  isExpired?: boolean;
  isWithinThreeDays?: boolean;
  end_date?: string;
  display_order?: number;
}

interface PDFFetchOptions {
  includeBranchInfo?: boolean;
  enabled?: boolean;
  language?: Language;
}

export const usePDFFetch = (
  category: 'menu' | 'offers',
  {
    includeBranchInfo = false,
    enabled = true,
    language = 'en'
  }: PDFFetchOptions = {}
) => {
  const queryKey = [
    'marketing-files',
    category,
    includeBranchInfo ? 'with-branch' : 'basic',
    language
  ];

  const fetchPDFFiles = async (): Promise<PDFFile[]> => {
    if (!enabled) {
      return [];
    }

    let query = supabase
      .from('marketing_files')
      .select(includeBranchInfo
        ? `
          *,
          branch:branch_name (
            id,
            name,
            name_ar
          )
        `
        : '*'
      )
      .eq('category', category)
      .eq('is_active', true);

    // Add ordering
    if (includeBranchInfo) {
      query = query.order('display_order', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${category} files:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      // Get public URLs for all files
      const filesWithUrls = await Promise.all(data.map(async (file) => {
        const { data: publicUrlData } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(file.file_path);

        if (!publicUrlData?.publicUrl) {
          console.error('Failed to get public URL for file:', file.file_path);
          return null;
        }

        // Validate URL format
        try {
          new URL(publicUrlData.publicUrl);
        } catch {
          console.error('Invalid URL generated:', publicUrlData.publicUrl);
          return null;
        }

        const enhancedFile: PDFFile = {
          ...file,
          url: publicUrlData.publicUrl
        };

        // Add branch information for offers
        if (includeBranchInfo && 'branch' in file) {
          const branchData = file as { branch?: { name?: string; name_ar?: string } };
          enhancedFile.branchName = language === 'ar'
            ? (branchData.branch?.name_ar || branchData.branch?.name)
            : branchData.branch?.name;

          // Add expiration logic for offers
          if (file.end_date) {
            const now = new Date().getTime();
            const endDate = new Date(file.end_date).getTime();
            enhancedFile.isExpired = endDate < now;
            enhancedFile.isWithinThreeDays = (now - endDate) < (3 * 24 * 60 * 60 * 1000);
          } else {
            enhancedFile.isExpired = false;
            enhancedFile.isWithinThreeDays = false;
          }
        }

        return enhancedFile;
      }));

      // Filter out null values from failed URL generations
      const validFiles = filesWithUrls.filter(item => item !== null);

      // Sort offers by display_order and expiration status
      if (includeBranchInfo) {
        return validFiles.sort((a, b) => {
          if (a.isExpired !== b.isExpired) {
            return a.isExpired ? 1 : -1;
          }
          return (a.display_order || 0) - (b.display_order || 0);
        });
      }

      return validFiles;
    }

    return [];
  };

  const { data: pdfFiles, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchPDFFiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled
  });

  return {
    pdfFiles: pdfFiles || [],
    isLoading,
    error
  };
};
