
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Plus, GripVertical } from 'lucide-react';

interface CustomerField {
  id?: string;
  field_name: string;
  is_required: boolean;
  is_visible: boolean;
  field_type: string;
  display_order: number;
}

interface CustomerFieldSettingsProps {
  isLoading: boolean;
}

export const CustomerFieldSettings = ({ isLoading }: CustomerFieldSettingsProps) => {
  const { language } = useLanguage();
  const [fields, setFields] = useState<CustomerField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Default fields if none exist
  const defaultFields: CustomerField[] = [
    { field_name: 'name', is_required: true, is_visible: true, field_type: 'text', display_order: 0 },
    { field_name: 'phone', is_required: true, is_visible: true, field_type: 'phone', display_order: 1 },
    { field_name: 'email', is_required: true, is_visible: true, field_type: 'email', display_order: 2 },
    { field_name: 'notes', is_required: false, is_visible: true, field_type: 'textarea', display_order: 3 },
  ];
  
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setDataLoading(true);
        const { data, error } = await supabase
          .from('customer_field_settings' as any)
          .select('*')
          .order('display_order', { ascending: true });
          
        if (error) {
          console.error('Error fetching customer fields:', error);
          // Use default fields if error
          setFields(defaultFields);
          return;
        }
        
        if (data && data.length > 0) {
          setFields(data as unknown as CustomerField[]);
        } else {
          // Use default fields if none exist
          setFields(defaultFields);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setFields(defaultFields);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchFields();
  }, []);
  
  const handleToggleRequired = (index: number) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        is_required: !updated[index].is_required
      };
      return updated;
    });
  };
  
  const handleToggleVisible = (index: number) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        is_visible: !updated[index].is_visible
      };
      return updated;
    });
  };
  
  const handleChangeFieldType = (index: number, type: string) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        field_type: type
      };
      return updated;
    });
  };
  
  const handleChangeFieldName = (index: number, name: string) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        field_name: name
      };
      return updated;
    });
  };
  
  const addNewField = () => {
    const newField = {
      field_name: '',
      is_required: false,
      is_visible: true,
      field_type: 'text',
      display_order: fields.length
    };
    
    setFields(prev => [...prev, newField]);
  };
  
  const removeField = (index: number) => {
    // Don't allow removing all fields
    if (fields.length <= 1) {
      toast.error(language === 'ar' ? 'يجب أن يكون هناك حقل واحد على الأقل' : 'You must have at least one field');
      return;
    }
    
    setFields(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update display order after removal
      return updated.map((field, idx) => ({
        ...field,
        display_order: idx
      }));
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const emptyNameField = fields.some(field => !field.field_name.trim());
    if (emptyNameField) {
      toast.error(language === 'ar' ? 'جميع الحقول يجب أن تحتوي على اسم' : 'All fields must have a name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Delete all existing fields and insert new ones
      const { error: deleteError } = await supabase
        .from('customer_field_settings' as any)
        .delete()
        .not('id', 'is', null);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert new fields
      const { error: insertError } = await supabase
        .from('customer_field_settings' as any)
        .insert(fields.map((field, index) => ({
          ...field,
          display_order: index
        })));
        
      if (insertError) {
        throw insertError;
      }
      
      toast.success(language === 'ar' ? 'تم حفظ إعدادات الحقول بنجاح' : 'Field settings saved successfully');
    } catch (error) {
      console.error('Error saving field settings:', error);
      toast.error(language === 'ar' ? 'فشل في حفظ إعدادات الحقول' : 'Failed to save field settings');
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
        <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2">
          <div className="col-span-1"></div>
          <div className="col-span-4">
            {language === 'ar' ? 'اسم الحقل' : 'Field Name'}
          </div>
          <div className="col-span-3">
            {language === 'ar' ? 'نوع الحقل' : 'Field Type'}
          </div>
          <div className="col-span-2 text-center">
            {language === 'ar' ? 'مطلوب' : 'Required'}
          </div>
          <div className="col-span-2 text-center">
            {language === 'ar' ? 'ظاهر' : 'Visible'}
          </div>
        </div>
        
        {fields.map((field, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center border p-3 rounded-md">
            <div className="col-span-1 flex justify-center cursor-move">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="col-span-4">
              <Input
                value={field.field_name}
                onChange={(e) => handleChangeFieldName(index, e.target.value)}
                placeholder={language === 'ar' ? 'اسم الحقل' : 'Field name'}
              />
            </div>
            
            <div className="col-span-3">
              <Select
                value={field.field_type}
                onValueChange={(value) => handleChangeFieldType(index, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    {language === 'ar' ? 'نص' : 'Text'}
                  </SelectItem>
                  <SelectItem value="email">
                    {language === 'ar' ? 'بريد إلكتروني' : 'Email'}
                  </SelectItem>
                  <SelectItem value="phone">
                    {language === 'ar' ? 'هاتف' : 'Phone'}
                  </SelectItem>
                  <SelectItem value="textarea">
                    {language === 'ar' ? 'نص طويل' : 'Text Area'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 flex justify-center">
              <Switch
                checked={field.is_required}
                onCheckedChange={() => handleToggleRequired(index)}
              />
            </div>
            
            <div className="col-span-1 flex justify-center">
              <Switch
                checked={field.is_visible}
                onCheckedChange={() => handleToggleVisible(index)}
              />
            </div>
            
            <div className="col-span-1 flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeField(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addNewField}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة حقل جديد' : 'Add New Field'}
        </Button>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
          : (language === 'ar' ? 'حفظ إعدادات الحقول' : 'Save Field Settings')}
      </Button>
    </form>
  );
};
