import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { Clock } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useBookingContext } from '@/contexts/BookingContext';

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  working_hours: any;
  is_main?: boolean;
}

interface BranchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  branches?: Branch[];
  onBranchSelect?: (branchId: string) => void;
}

export function BranchDialog({
  open,
  onOpenChange,
  branches: externalBranches,
  onBranchSelect: externalBranchSelect
}: BranchDialogProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { getCurrentDayHours } = useTimeFormatting();

  // Get setSelectedBranch from context, but don't require it
  let contextValue = null;
  try {
    contextValue = useBookingContext();
  } catch (error) {
    // Silently handle the error when BookingContext is not available
    console.log("BookingContext not available in current view");
  }

  // Update isOpen when open prop changes
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle onOpenChange
  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };

  useEffect(() => {
    if (externalBranches) {
      setBranches(externalBranches);
      setIsLoading(false);
      return;
    }

    const fetchBranches = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, name_ar, address, address_ar, working_hours, is_main')
          .order('is_main', { ascending: false });

        if (error) {
          console.error("Error fetching branches:", error);
          toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: language === 'ar' ? 'فشل في تحميل الفروع' : 'Failed to load branches',
            variant: "destructive",
          });
          return;
        }

        setBranches(data || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [language, toast, externalBranches]);

  // Handle branch selection
  const handleBranchSelect = (branchId: string) => {
    const selectedBranch = branches.find(branch => branch.id === branchId);
    
    if (!selectedBranch) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'لم يتم العثور على الفرع' : 'Branch not found',
        variant: "destructive",
      });
      return;
    }
    
    // Set selected branch in context if available
    if (contextValue?.setSelectedBranch) {
      contextValue.setSelectedBranch(selectedBranch);
    }
    
    // Close the dialog
    handleOpenChange(false);
    
    // Call external handler or navigate
    if (externalBranchSelect) {
      externalBranchSelect(branchId);
    } else {
      navigate('/bookings?branch=' + branchId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#222222] mb-4">
            {t('select.branch')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="w-full h-[90px] flex flex-row items-center justify-between gap-3 px-4 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
              onClick={() => handleBranchSelect(branch.id)}
            >
              <div className={`flex flex-col items-${language === 'ar' ? 'end' : 'start'} flex-shrink min-w-0 max-w-[70%]`}>
                <span className="w-full font-bold text-base text-[#222222] group-hover:text-[#C4A36F] transition-colors truncate">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="w-full text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors truncate mt-1">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </span>
              </div>
              <div className={`flex-shrink-0 ${language === 'ar' ? 'border-s' : 'border-e'} border-gray-200 ${language === 'ar' ? 'ps-3' : 'pe-3'}`}>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#C4A36F]">
                  <Clock className="w-4 h-4" />
                  <span className="group-hover:text-[#C4A36F] transition-colors whitespace-nowrap">
                    {getCurrentDayHours(branch.working_hours, language === 'ar')}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
