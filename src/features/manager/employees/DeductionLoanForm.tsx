import { format } from "date-fns";
import { Info } from "lucide-react";
import React from "react";
import { z } from "zod";

import { useToast } from "@shared/hooks/use-toast";
import { supabase } from "@shared/lib/supabase/client";
import { Button } from "@shared/ui/components/button";
import { Calendar } from "@shared/ui/components/calendar";
import { Input } from "@shared/ui/components/input";
import { Label } from "@shared/ui/components/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/ui/components/tooltip";




interface DeductionLoanFormProps {
  employeeId: string;
  employeeName: string;
  type: 'deduction' | 'loan';
  onSuccess: () => void;
}

// Zod validation schema
const formSchema = z.object({
  amount: z
    .string()
    .min(1, "المبلغ مطلوب")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "يجب أن يكون المبلغ رقماً موجباً"),
  description: z
    .string()
    .max(200, "الوصف يجب أن يكون أقل من 200 حرف")
    .optional(),
  date: z.date({
    required_error: "التاريخ مطلوب",
  }),
  source: z.enum(['other']).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Tooltip wrapper component for form fields
const FieldWithTooltip = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
  <div className="flex items-center gap-1">
    {children}
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-gray-400 cursor-help">
          <Info className="h-3.5 w-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-800 text-white">
        <p className="max-w-xs text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

export const DeductionLoanForm = ({ employeeId, employeeName, type, onSuccess }: DeductionLoanFormProps) => {
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState<Date>();
  const [description, setDescription] = React.useState('');
  const [source, setSource] = React.useState<'other'>('other');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validation states
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof FormData, boolean>>>({});

  // Validation function
  const validateField = (field: keyof FormData, value: string | Date | undefined) => {
    try {
      const fieldSchema = formSchema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0]?.message }));
      }
    }
  };


  const handleSubmit = async () => {
    // Full form validation
    const formData = {
      amount,
      description,
      date,
      source: type === 'loan' ? source : undefined,
    };

    try {
      formSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    // Basic validation check
    if (!amount || !date) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال المبلغ والتاريخ",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'loan') {
        // Create loan record
        const { error: recordError } = await supabase
          .from("employee_loans")
          .insert({
            employee_id: employeeId,
            employee_name: employeeName,
            amount: parseFloat(amount),
            description: description || null,
            date: format(date, 'yyyy-MM-dd'),
            source
          });

        if (recordError) {
          throw recordError;
        }
      } else if (type === 'deduction') {
        // Create deduction record
        const { error: recordError } = await supabase
          .from("employee_deductions")
          .insert({
            employee_id: employeeId,
            employee_name: employeeName,
            amount: parseFloat(amount),
            description: description || null,
            date: format(date, 'yyyy-MM-dd')
          });

        if (recordError) {
          throw recordError;
        }
      }

      // Success handling
      toast({
        title: `تم إضافة ${type === 'deduction' ? 'الخصم' : 'السلفة'} بنجاح`,
      });

      // Reset form completely
      setAmount('');
      setDate(undefined);
      setDescription('');
      setSource('other');
      setErrors({});
      setTouched({});
      setIsSubmitting(false);

      // Call onSuccess to close the panel
      onSuccess();
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: `خطأ في إضافة ${type === 'deduction' ? 'الخصم' : 'السلفة'}`,
        description: errorMessage,
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div>
          <FieldWithTooltip tooltip="أدخل المبلغ بالريال السعودي، مثال: 1500.50">
            <Label>المبلغ *</Label>
          </FieldWithTooltip>
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setTouched(prev => ({ ...prev, amount: true }));
              validateField('amount', e.target.value);
            }}
            placeholder="أدخل المبلغ"
            required
            disabled={isSubmitting}
            className={errors.amount && touched.amount ? "border-red-500" : ""}
          />
          {errors.amount && touched.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>
        <div>
          <FieldWithTooltip tooltip="وصف اختياري للعملية، مثال: خصم تأخير، سلفة شخصية">
            <Label>الوصف</Label>
          </FieldWithTooltip>
          <Input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setTouched(prev => ({ ...prev, description: true }));
              validateField('description', e.target.value);
            }}
            placeholder="أدخل الوصف (اختياري)"
            disabled={isSubmitting}
            className={errors.description && touched.description ? "border-red-500" : ""}
          />
          {errors.description && touched.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>
        <div>
          <FieldWithTooltip tooltip="اختر تاريخ العملية">
            <Label>التاريخ *</Label>
          </FieldWithTooltip>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setTouched(prev => ({ ...prev, date: true }));
              validateField('date', selectedDate);
            }}
            required
            disabled={isSubmitting}
            className={errors.date && touched.date ? "border-red-500" : ""}
          />
          {errors.date && touched.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>


        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري التحميل...
            </div>
          ) : (
            'تأكيد'
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
};
