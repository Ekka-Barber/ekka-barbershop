import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { supabase } from "@shared/lib/supabase/client";
import { Button } from "@shared/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/ui/components/dialog";
import { Input } from "@shared/ui/components/input";
import { Textarea } from "@shared/ui/components/textarea";
import { useToast } from "@shared/ui/components/use-toast";

import { useLanguage } from "@/contexts/LanguageContext";





interface EditElementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  element: {
    id: string;
    display_name: string;
    display_name_ar: string;
    description: string | null;
    description_ar: string | null;
  } | null;
}

export const EditElementDialog = ({ isOpen, onClose, element }: EditElementDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    display_name: "",
    display_name_ar: "",
    description: "",
    description_ar: "",
  });

  useEffect(() => {
    if (element) {
      setFormData({
        display_name: element.display_name,
        display_name_ar: element.display_name_ar,
        description: element.description || "",
        description_ar: element.description_ar || "",
      });
    }
  }, [element]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("ui_elements")
        .update({
          display_name: data.display_name,
          display_name_ar: data.display_name_ar,
          description: data.description || null,
          description_ar: data.description_ar || null,
        })
        .eq("id", element?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ui-elements"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث النص بنجاح" : "Text updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "حدث خطأ أثناء التحديث" : "An error occurred while updating",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "تحرير النص" : "Edit Text"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" ? "قم بتحديث النص والوصف لعنصر واجهة المستخدم" : "Update the text and description for the UI element"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {language === "ar" ? "النص الإنجليزي" : "English Text"}
              </label>
              <Input
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder={language === "ar" ? "أدخل النص بالإنجليزية" : "Enter English text"}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === "ar" ? "النص العربي" : "Arabic Text"}
              </label>
              <Input
                value={formData.display_name_ar}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name_ar: e.target.value,
                  }))
                }
                placeholder={language === "ar" ? "أدخل النص بالعربية" : "Enter Arabic text"}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === "ar" ? "الوصف بالإنجليزية (اختياري)" : "English Description (Optional)"}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={language === "ar" ? "أدخل الوصف بالإنجليزية" : "Enter English description"}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === "ar" ? "الوصف بالعربية (اختياري)" : "Arabic Description (Optional)"}
              </label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description_ar: e.target.value,
                  }))
                }
                placeholder={language === "ar" ? "أدخل الوصف بالعربية" : "Enter Arabic description"}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit">
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 
