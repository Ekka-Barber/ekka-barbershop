
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BookingTimeSettings } from './BookingTimeSettings';
import { CustomerFieldSettings } from './CustomerFieldSettings';
import { TermsAndConditionsSettings } from './TermsAndConditionsSettings';

export interface BookingSettingsProps {
  initialTab?: string;
}

interface BookingSettingsType {
  id?: string;
  min_advance_time_minutes: number;
  max_advance_days: number;
  slot_duration_minutes: number;
  require_terms_acceptance?: boolean;
}

const BookingSettings = ({ initialTab = 'time-settings' }: BookingSettingsProps) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookingSettings, setBookingSettings] = useState<BookingSettingsType>({
    min_advance_time_minutes: 15,
    max_advance_days: 60,
    slot_duration_minutes: 30,
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // We need to use the any type here because the database type definitions haven't been updated yet
        const { data, error } = await supabase
          .from('booking_settings' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching booking settings:', error);
          return;
        }
        
        if (data) {
          // Use a type assertion with an intermediate 'unknown' type
          setBookingSettings(data as unknown as BookingSettingsType);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSaveTimeSettings = async (timeSettings: any) => {
    try {
      const { error } = await supabase
        .from('booking_settings' as any)
        .upsert({
          ...bookingSettings,
          ...timeSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });
        
      if (error) {
        toast.error(language === 'ar' ? 'فشل في حفظ الإعدادات' : 'Failed to save settings');
        console.error('Error saving booking settings:', error);
        return;
      }
      
      setBookingSettings(prev => ({ ...prev, ...timeSettings }));
      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(language === 'ar' ? 'فشل في حفظ الإعدادات' : 'Failed to save settings');
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {language === 'ar' ? 'إعدادات الحجز' : 'Booking Settings'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'قم بتخصيص كيفية عمل نظام الحجز الخاص بك' 
            : 'Configure how your booking system works'}
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="time-settings">
            {language === 'ar' ? 'إعدادات الوقت' : 'Time Settings'}
          </TabsTrigger>
          <TabsTrigger value="customer-fields">
            {language === 'ar' ? 'حقول العميل' : 'Customer Fields'}
          </TabsTrigger>
          <TabsTrigger value="terms-conditions">
            {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="time-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'إعدادات وقت الحجز' : 'Booking Time Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تحكم في مواعيد وفترات الحجز المتاحة'
                  : 'Control when and how far in advance customers can book'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingTimeSettings 
                settings={bookingSettings} 
                onSave={handleSaveTimeSettings}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer-fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'إعدادات حقول العميل' : 'Customer Field Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تحديد المعلومات المطلوبة من العملاء'
                  : 'Configure what information to collect from customers'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerFieldSettings isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms-conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'إدارة نص الشروط والأحكام الخاص بالحجز'
                  : 'Manage booking terms and conditions text'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TermsAndConditionsSettings isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingSettings;
