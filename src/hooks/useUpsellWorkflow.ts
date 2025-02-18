
import { useBooking } from '@/hooks/useBooking';
import { Service } from '@/types/service';
import { useBookingUpsells } from '@/hooks/useBookingUpsells';

export const useUpsellWorkflow = () => {
  const { upsellsForSelectedServices } = useBookingUpsells();
  const { addService, removeService } = useBooking();

  const handleAddUpsell = (service: Service) => {
    addService(service);
  };

  const handleRemoveUpsell = (service: Service) => {
    removeService(service);
  };

  return {
    upsellsForSelectedServices,
    handleAddUpsell,
    handleRemoveUpsell
  };
};
