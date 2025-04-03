import { useEffect, useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

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
  google_places_api_key: string | null;
  google_place_id: string | null;
}

export default function GooglePlacesSettings() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [placeId, setPlaceId] = useState('');

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*');
      if (error) throw error;
      return data as Branch[];
    }
  });

  useEffect(() => {
    if (selectedBranch) {
      setApiKey(selectedBranch.google_places_api_key || '');
      setPlaceId(selectedBranch.google_place_id || '');
    }
  }, [selectedBranch]);

  const updateBranchMutation = useMutation({
    mutationFn: async (variables: { id: string; google_places_api_key: string; google_place_id: string }) => {
      const { error } = await supabase
        .from('branches')
        .update({
          google_places_api_key: variables.google_places_api_key,
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
      console.error('Error updating branch:', error);
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
      google_places_api_key: apiKey,
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
              {language === 'ar' ? 'مفتاح API' : 'API Key'}
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل مفتاح API' : 'Enter API key'}
            />
          </div>

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
