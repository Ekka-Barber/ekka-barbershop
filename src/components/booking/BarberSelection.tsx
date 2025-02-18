
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/hooks/useBooking';
import { Employee, Branch } from '@/types/booking';
import { BarberCard } from './barber/BarberCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBranchManagement } from '@/hooks/booking/useBranchManagement';

const BarberSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { branch } = useBranchManagement();
  const { selectedServices, selectedDate, selectedBarber, setSelectedBarber, employeeWorkingHours } = useBooking(branch);

  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ['barbers', branch?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'barber')
        .eq('branch_id', branch.id);
        
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!branch?.id
  });

  if (!selectedServices?.length) {
    navigate('/customer');
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {barbers.map((barber) => {
          const isAvailable = selectedDate 
            ? employeeWorkingHours?.[barber.id]?.includes(selectedDate.toISOString().split('T')[0]) ?? true
            : true;

          return (
            <BarberCard
              key={barber.id}
              id={barber.id}
              name={barber.name}
              name_ar={barber.name_ar}
              photo_url={barber.photo_url}
              nationality={barber.nationality}
              isAvailable={isAvailable}
              isSelected={selectedBarber?.id === barber.id}
              onSelect={() => setSelectedBarber(barber)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BarberSelection;
