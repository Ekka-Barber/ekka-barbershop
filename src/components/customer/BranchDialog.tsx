import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingContext } from '@/contexts/BookingContext';

interface Branch {
  id: string;
  name: string;
  is_main: boolean;
}

export function BranchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  // Get setSelectedBranch from context
  const { setSelectedBranch } = useBookingContext();

  useEffect(() => {
    const fetchBranches = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, is_main')
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
  }, [language, toast]);

  // Update handleBranchSelect to set selected branch in context
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsOpen(false);
    navigate('/bookings');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {language === 'ar' ? 'احجز الآن' : 'Book Now'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{language === 'ar' ? 'اختر فرعاً' : 'Choose a Branch'}</DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? 'الرجاء اختيار الفرع الذي ترغب في حجز موعد به.'
              : 'Please select the branch you would like to book an appointment at.'}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="grid gap-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <RadioGroup className="grid gap-4 py-4">
            {branches.map((branch) => (
              <div key={branch.id} className="flex items-center space-x-2">
                <RadioGroupItem value={branch.id} id={branch.id} className="peer h-5 w-5 shrink-0 rounded-full border-2 border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <Label htmlFor={branch.id} className="cursor-pointer peer-checked:text-primary">
                  {branch.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        <DialogFooter>
          <Button type="submit" onClick={() => {
            const selectedBranchId = document.querySelector('input[name="root"]:checked')?.id;
            const selectedBranch = branches.find(branch => branch.id === selectedBranchId);
            if (selectedBranch) {
              handleBranchSelect(selectedBranch);
            } else {
              toast({
                title: language === 'ar' ? 'تنبيه' : 'Warning',
                description: language === 'ar' ? 'الرجاء اختيار فرع' : 'Please select a branch',
              });
            }
          }}>
            {language === 'ar' ? 'تأكيد' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
