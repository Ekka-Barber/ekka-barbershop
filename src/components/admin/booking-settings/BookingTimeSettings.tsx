
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar } from 'lucide-react';

interface TimeSettings {
  min_advance_time_minutes: number;
  max_advance_days: number;
  slot_duration_minutes: number;
}

interface BookingTimeSettingsProps {
  settings: TimeSettings;
  onSave: (settings: TimeSettings) => Promise<void>;
  isLoading: boolean;
}

export const BookingTimeSettings = ({ 
  settings, 
  onSave,
  isLoading 
}: BookingTimeSettingsProps) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<TimeSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (field: keyof TimeSettings, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };
  
  const slotDurationOptions = [15, 30, 45, 60, 90, 120];
  
  // Format minutes into hours and minutes for display
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return language === 'ar' 
        ? `${minutes} دقيقة` 
        : `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return language === 'ar' 
          ? `${hours} ساعة` 
          : `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return language === 'ar' 
          ? `${hours} ساعة و ${remainingMinutes} دقيقة` 
          : `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
      }
    }
  };
  
  if (isLoading) {
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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Label htmlFor="min-advance-time">
              {language === 'ar' ? 'الحد الأدنى للوقت المسبق للحجز' : 'Minimum advance booking time'}
            </Label>
          </div>
          <div className="grid gap-2">
            <Slider
              id="min-advance-time"
              min={0}
              max={180}
              step={5}
              value={[formData.min_advance_time_minutes]}
              onValueChange={(values) => handleChange('min_advance_time_minutes', values[0])}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{language === 'ar' ? 'فوري' : 'Immediate'}</span>
              <span>{language === 'ar' ? 'ساعة' : '1 hour'}</span>
              <span>{language === 'ar' ? 'ساعتين' : '2 hours'}</span>
              <span>{language === 'ar' ? '3 ساعات' : '3 hours'}</span>
            </div>
            <p className="text-sm font-medium mt-2">
              {language === 'ar'
                ? `الحجز مسموح قبل ${formatMinutes(formData.min_advance_time_minutes)} من وقت الموعد`
                : `Booking allowed ${formatMinutes(formData.min_advance_time_minutes)} before appointment time`}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Label htmlFor="max-advance-days">
              {language === 'ar' ? 'أقصى فترة حجز مسبقة' : 'Maximum advance booking period'}
            </Label>
          </div>
          <div className="flex gap-4 items-center">
            <Input
              id="max-advance-days"
              type="number"
              min={1}
              max={365}
              value={formData.max_advance_days}
              onChange={(e) => handleChange('max_advance_days', parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span>
              {language === 'ar' ? 'أيام' : 'days'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'ar'
              ? `يمكن للعملاء الحجز مسبقًا حتى ${formData.max_advance_days} يوم`
              : `Customers can book up to ${formData.max_advance_days} days in advance`}
          </p>
        </div>
        
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Label htmlFor="slot-duration">
              {language === 'ar' ? 'مدة الفترة الزمنية' : 'Time slot duration'}
            </Label>
          </div>
          <Select
            value={formData.slot_duration_minutes.toString()}
            onValueChange={(value) => handleChange('slot_duration_minutes', parseInt(value))}
          >
            <SelectTrigger id="slot-duration" className="w-[180px]">
              <SelectValue placeholder={language === 'ar' ? 'اختر المدة' : 'Select duration'} />
            </SelectTrigger>
            <SelectContent>
              {slotDurationOptions.map((duration) => (
                <SelectItem key={duration} value={duration.toString()}>
                  {formatMinutes(duration)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {language === 'ar'
              ? `الفترة الزمنية الافتراضية لكل حجز`
              : `Default time slot for each booking`}
          </p>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving
          ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
          : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
      </Button>
    </form>
  );
};
