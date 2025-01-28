import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

const STEPS = [
  'services',
  'datetime',
  'barber',
  'details'
] as const;

type Step = typeof STEPS[number];

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  duration: number;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const Bookings = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');

  const [currentStep, setCurrentStep] = useState<Step>('services');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Fetch branch details
  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  // Fetch service categories with their services
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          services (
            id,
            name_en,
            name_ar,
            description_en,
            description_ar,
            price,
            duration
          )
        `);
      
      if (categoriesError) throw categoriesError;
      return categories;
    },
  });

  // Fetch employees for the selected branch
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, {
        id: service.id,
        name: language === 'ar' ? service.name_ar : service.name_en,
        price: service.price,
        duration: service.duration
      }]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 9; // Start at 9 AM
    let minutes = 0;
    
    while (hour < 22) { // End at 10 PM
      slots.push(format(new Date().setHours(hour, minutes), 'HH:mm'));
      minutes += 30;
      if (minutes === 60) {
        minutes = 0;
        hour += 1;
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const renderStepContent = () => {
    switch (currentStep) {
      case 'services':
        return (
          <div className="space-y-4">
            {categoriesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {categories?.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-lg font-semibold">
                      {language === 'ar' ? category.name_ar : category.name_en}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4">
                        {category.services?.map((service) => (
                          <div key={service.id} className="flex items-start space-x-4 rtl:space-x-reverse">
                            <Checkbox
                              checked={selectedServices.some(s => s.id === service.id)}
                              onCheckedChange={() => handleServiceToggle(service)}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {language === 'ar' ? service.name_ar : service.name_en}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {language === 'ar' ? service.description_ar : service.description_en}
                              </p>
                              <div className="mt-1 text-sm">
                                {service.price} SAR • {service.duration} min
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border mx-auto"
              disabled={(date) => date < new Date()}
            />
            
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'barber':
        return (
          <div className="space-y-4">
            {employeesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : (
              <div className="grid gap-4">
                {employees?.map((employee) => (
                  <Button
                    key={employee.id}
                    variant={selectedBarber === employee.id ? "default" : "outline"}
                    onClick={() => setSelectedBarber(employee.id)}
                    className="h-auto py-4 justify-start"
                  >
                    <div className="text-left rtl:text-right">
                      <div className="font-medium">
                        {language === 'ar' ? employee.name_ar : employee.name}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{t('phone')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Input
                  id="notes"
                  value={customerDetails.notes}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">{t('booking.summary')}</h3>
              
              <div className="space-y-2 text-sm">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>{service.price} SAR</span>
                  </div>
                ))}
                
                <div className="border-t pt-2 font-medium flex justify-between">
                  <span>{t('total')}</span>
                  <span>{totalPrice} SAR</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('select.branch')}
          </h1>
          <Button 
            className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/customer')}
          >
            {t('go.back')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow max-w-md mx-auto w-full pt-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#222222] mb-2">
            {t('book.appointment')}
          </h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-4"></div>
          
          {/* Branch Information */}
          {branchLoading ? (
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
          ) : branch ? (
            <div className="text-lg text-gray-600 mb-6">
              {language === 'ar' ? branch.name_ar : branch.name}
              <br />
              <span className="text-sm text-gray-500">
                {language === 'ar' ? branch.address_ar : branch.address}
              </span>
            </div>
          ) : null}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div
                  key={step}
                  className={`flex items-center space-x-1 rtl:space-x-reverse cursor-pointer ${
                    isCompleted ? 'text-[#C4A36F]' : 
                    isCurrent ? 'text-[#222222] font-medium' : 
                    'text-gray-400'
                  }`}
                  onClick={() => {
                    if (index <= currentStepIndex) {
                      setCurrentStep(step);
                    }
                  }}
                >
                  <span>
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  <span className="hidden sm:inline">
                    {t(`step.${step}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStepIndex > 0) {
                setCurrentStep(STEPS[currentStepIndex - 1]);
              } else {
                navigate('/customer');
              }
            }}
            className="flex-1"
          >
            {currentStepIndex === 0 ? t('back.home') : t('previous')}
          </Button>
          
          {currentStepIndex < STEPS.length - 1 && (
            <Button
              onClick={() => setCurrentStep(STEPS[currentStepIndex + 1])}
              className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
              disabled={
                (currentStep === 'services' && selectedServices.length === 0) ||
                (currentStep === 'datetime' && (!selectedDate || !selectedTime)) ||
                (currentStep === 'barber' && !selectedBarber)
              }
            >
              {t('next')}
            </Button>
          )}
          
          {currentStepIndex === STEPS.length - 1 && (
            <Button
              onClick={() => {
                // Handle booking submission
                console.log('Booking submitted:', {
                  services: selectedServices,
                  date: selectedDate,
                  time: selectedTime,
                  barber: selectedBarber,
                  customer: customerDetails
                });
              }}
              className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
              disabled={!customerDetails.name || !customerDetails.phone}
            >
              {t('confirm.booking')}
            </Button>
          )}
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Bookings;