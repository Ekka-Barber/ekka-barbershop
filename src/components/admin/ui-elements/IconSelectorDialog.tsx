import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
// Import the static list
import { lucideIconList } from '@/lib/lucide-icons-list';
// Still need the main import for rendering
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  elementId: string | null;
  currentIcon: string | null;
}

export const IconSelectorDialog = ({
  isOpen,
  onClose,
  elementId,
  currentIcon,
}: IconSelectorDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(currentIcon);

  // Use the imported static list
  const allIcons = useMemo(() => {
    return lucideIconList;
  }, []);

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    if (!searchTerm) return allIcons; // Return the full list if search is empty
    return allIcons.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allIcons, searchTerm]);

  const updateMutation = useMutation({
    mutationFn: async (iconName: string | null) => {
      if (!iconName || !elementId) {
        throw new Error('Icon name and element ID are required');
      }
      const { error } = await supabase
        .from("ui_elements")
        .update({ icon: iconName })
        .eq("id", elementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ui-elements"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث الأيقونة بنجاح" : "Icon updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "حدث خطأ أثناء التحديث" : "An error occurred while updating",
        variant: "destructive",
      });
      console.error("Error updating icon:", error);
    },
  });

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
  };

  const handleSave = () => {
    if (selectedIcon && elementId) {
      if (selectedIcon) {
        updateMutation.mutate(selectedIcon);
      }
    }
  };

  const renderIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return Icon ? <Icon className="h-6 w-6" /> : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "اختر أيقونة" : "Select Icon"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" ? "اختر أيقونة من المكتبة لعنصر واجهة المستخدم" : "Choose an icon from the library for the UI element"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Input
            placeholder={
              language === "ar" ? "ابحث عن أيقونة..." : "Search icons..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="grid grid-cols-6 gap-4">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((name) => {
                  const isSelected = selectedIcon === name;
                  return (
                    <Button
                      key={name}
                      variant="outline"
                      className={cn(
                        "h-12 w-12 p-0",
                        isSelected && "border-primary bg-primary/10"
                      )}
                      onClick={() => handleIconSelect(name)}
                    >
                      {renderIcon(name)}
                    </Button>
                  );
                })
              ) : (
                <div className="col-span-6 text-center py-8 text-muted-foreground">
                  {language === "ar" ? "لا توجد نتائج" : "No icons found"}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {language === "ar" ? "الأيقونة المختارة:" : "Selected Icon:"}
            </span>
            {selectedIcon && (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                  {renderIcon(selectedIcon)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedIcon}
                </span>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={!selectedIcon}>
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
