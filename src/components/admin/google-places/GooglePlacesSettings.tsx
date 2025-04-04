
import { useEffect, useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
  whatsapp_number: string;
  google_maps_url: string;
  working_hours: Record<string, string[]>;
  google_place_id: string | null;
}

export default function GooglePlacesSettings() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [placeId, setPlaceId] = useState('');

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, created_at, updated_at, whatsapp_number, google_maps_url, working_hours, google_place_id');
      
      if (error) throw error;
      return data as Branch[];
    }
  });

  useEffect(() => {
    if (selectedBranch) {
      setPlaceId(selectedBranch.google_place_id || '');
    }
  }, [selectedBranch]);

  const updateBranchMutation = useMutation({
    mutationFn: async (variables: { id: string; google_place_id: string }) => {
      logger.info(`Updating branch ${variables.id} with place ID: ${variables.google_place_id}`);
      
      const { error } = await supabase
        .from('branches')
        .update({
          google_place_id: variables.google_place_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', variables.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: language === 'ar' ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
        duration: 3000
      });
    },
    onError: (error) => {
      logger.error('Error updating branch:', error);
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'Error',
        description: language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings',
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    updateBranchMutation.mutate({
      id: selectedBranch.id,
      google_place_id: placeId
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {language === 'ar' ? 'اختر الفرع' : 'Select Branch'}
        </label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedBranch?.id || ''}
          onChange={(e) => {
            const branch = branches?.find(b => b.id === e.target.value);
            setSelectedBranch(branch || null);
          }}
        >
          <option value="">{language === 'ar' ? 'اختر فرع' : 'Select a branch'}</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {language === 'ar' ? branch.name_ar : branch.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBranch && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              {language === 'ar' ? 'معرف المكان' : 'Place ID'}
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل معرف المكان' : 'Enter Place ID'}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'ar' 
                ? 'معرف المكان من Google Maps غير سري ويمكن استخدامه للوصول إلى معلومات المكان' 
                : 'The Place ID from Google Maps is not sensitive and can be used to access location information'}
            </p>
            <p className="text-xs text-muted-foreground">
              <a 
                href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {language === 'ar' ? 'كيفية العثور على معرف المكان' : 'How to find a Place ID'}
              </a>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#C4A36F] text-white py-2 px-4 rounded-md hover:bg-[#B39260] transition-colors"
            disabled={updateBranchMutation.isPending}
          >
            {updateBranchMutation.isPending
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
              : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
          </button>
        </form>
      )}
    </div>
  );
}
