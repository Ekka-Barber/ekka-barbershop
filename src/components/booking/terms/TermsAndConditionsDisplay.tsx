
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TermsAndConditions {
  id: string;
  content_en: string;
  content_ar: string;
  version: number;
  is_active: boolean;
  effective_from: string;
}

export const TermsAndConditionsDisplay = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const { data: termsData, isLoading, error } = useQuery({
    queryKey: ["terms_and_conditions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("terms_and_conditions")
        .select("*")
        .eq("is_active", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      return data as TermsAndConditions;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !termsData) {
    return (
      <div className="text-sm text-red-500 mt-4">
        {language === "ar"
          ? "حدث خطأ في تحميل الشروط والأحكام"
          : "Error loading terms and conditions"}
      </div>
    );
  }

  const termsContent = language === "ar" ? termsData.content_ar : termsData.content_en;
  const termsLabel = language === "ar" 
    ? `الشروط والأحكام (الإصدار ${termsData.version})` 
    : `Terms and Conditions (v${termsData.version})`;

  return (
    <div className="mt-4 border rounded-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex w-full justify-between p-4 font-medium text-left"
          >
            <span>{termsLabel}</span>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0 text-sm">
          <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
            {termsContent}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
