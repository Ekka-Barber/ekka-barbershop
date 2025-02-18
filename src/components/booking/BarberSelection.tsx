
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/hooks/useBooking';
import { Employee } from '@/types/booking';
import { BarberCard } from './barber/BarberCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const BarberSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedServices, selectedDate, selectedBarber, setSelectedBarber } = useBooking();

  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'barber');
        
      if (error) throw error;
      return data as Employee[];
    }
  });

  if (!selectedServices?.length) {
    navigate('/customer');
    return null;
  }

  const handleBarberSelect = (barber: Employee) => {
    setSelectedBarber(barber);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {barbers.map((barber) => (
          <BarberCard
            key={barber.id}
            barber={barber}
            isSelected={selectedBarber?.id === barber.id}
            onSelect={() => handleBarberSelect(barber)}
            date={selectedDate}
          />
        ))}
      </div>
    </div>
  );
};

export default BarberSelection;
