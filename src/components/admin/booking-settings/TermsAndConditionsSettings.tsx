
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TermsAndConditions {
  id?: string;
  content_en: string;
  content_ar: string;
  version: number;
  is_active: boolean;
}

interface TermsAndConditionsSettingsProps {
  isLoading: boolean;
}

export const TermsAndConditionsSettings = ({ isLoading }: TermsAndConditionsSettingsProps) => {
  const { language } = useLanguage();
  const [terms, setTerms] = useState<TermsAndConditions>({
    content_en: '',
    content_ar: '',
    version: 1,
    is_active: true
  });
  const [requireAcceptance, setRequireAcceptance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setDataLoading(true);
        const { data, error } = await supabase
          .from('terms_and_conditions' as any)
          .select('*')
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          console.error('Error fetching terms and conditions:', error);
          return;
        }
        
        if (data) {
          setTerms(data as TermsAndConditions);
        }
        
        // Fetch the setting for requiring acceptance
        const { data: settingsData, error: settingsError } = await supabase
          .from('booking_settings' as any)
          .select('require_terms_acceptance')
          .limit(1)
          .maybeSingle();
          
        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching terms acceptance setting:', settingsError);
          return;
        }
        
        if (settingsData && settingsData.require_terms_acceptance !== undefined) {
          setRequireAcceptance(!!settingsData.require_terms_acceptance);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchTerms();
  }, []);
  
  const handleContentChange = (lang: 'en' | 'ar', value: string) => {
    setTerms(prev => ({
      ...prev,
      [`content_${lang}`]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate content
    if (!terms.content_en.trim() || !terms.content_ar.trim()) {
      toast.error(
        language === 'ar'
          ? 'يجب ملء محتوى الشروط والأحكام بكلا اللغتين'
          : 'Terms and conditions content must be filled in both languages'
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if we need to create a new version
      let newVersion = terms.version;
      const hasId = !!terms.id;
      
      if (hasId) {
        // If editing existing terms, increment version
        newVersion = terms.version + 1;
      }
      
      // Insert new terms version
      const { error: termsError } = await supabase
        .from('terms_and_conditions' as any)
        .insert({
          content_en: terms.content_en,
          content_ar: terms.content_ar,
          version: newVersion,
          is_active: true,
          effective_from: new Date().toISOString()
        });
        
      if (termsError) {
        throw termsError;
      }
      
      // If this is a new version, set all other versions to inactive
      if (hasId) {
        const { error: updateError } = await supabase
          .from('terms_and_conditions' as any)
          .update({ is_active: false })
          .neq('version', newVersion);
          
        if (updateError) {
          console.error('Error updating older terms versions:', updateError);
        }
      }
      
      // Update the require acceptance setting
      const { error: settingsError } = await supabase
        .from('booking_settings' as any)
        .upsert({
          require_terms_acceptance: requireAcceptance,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
        
      if (settingsError) {
        console.error('Error updating terms acceptance setting:', settingsError);
      }
      
      toast.success(
        language === 'ar'
          ? 'تم حفظ الشروط والأحكام بنجاح'
          : 'Terms and conditions saved successfully'
      );
      
      // Update local terms data with new version
      setTerms(prev => ({
        ...prev,
        version: newVersion
      }));
    } catch (error) {
      console.error('Error saving terms and conditions:', error);
      toast.error(
        language === 'ar'
          ? 'فشل في حفظ الشروط والأحكام'
          : 'Failed to save terms and conditions'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-t-primary rounded-full animate-spin"></div>
        <span className="ml-2">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </span>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="require-acceptance"
            checked={requireAcceptance}
            onCheckedChange={setRequireAcceptance}
          />
          <Label htmlFor="require-acceptance">
            {language === 'ar'
              ? 'يتطلب قبول الشروط والأحكام للحجز'
              : 'Require terms and conditions acceptance for booking'}
          </Label>
        </div>
        
        <div className="pt-4">
          <Label htmlFor="terms-en" className="text-base font-medium">
            {language === 'ar' ? 'الشروط والأحكام (الإنجليزية)' : 'Terms & Conditions (English)'}
          </Label>
          <Textarea
            id="terms-en"
            value={terms.content_en}
            onChange={(e) => handleContentChange('en', e.target.value)}
            placeholder="Enter the terms and conditions in English"
            className="mt-2 min-h-[200px]"
          />
        </div>
        
        <div className="pt-2">
          <Label htmlFor="terms-ar" className="text-base font-medium">
            {language === 'ar' ? 'الشروط والأحكام (العربية)' : 'Terms & Conditions (Arabic)'}
          </Label>
          <Textarea
            id="terms-ar"
            value={terms.content_ar}
            onChange={(e) => handleContentChange('ar', e.target.value)}
            placeholder="أدخل الشروط والأحكام باللغة العربية"
            className="mt-2 min-h-[200px]"
            dir="rtl"
          />
        </div>
        
        {terms.version > 1 && (
          <p className="text-sm text-muted-foreground">
            {language === 'ar'
              ? `الإصدار الحالي: ${terms.version}`
              : `Current version: ${terms.version}`}
          </p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
          : (language === 'ar' ? 'حفظ الشروط والأحكام' : 'Save Terms & Conditions')}
      </Button>
    </form>
  );
};
