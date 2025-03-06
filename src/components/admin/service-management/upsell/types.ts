
import { Service } from '@/types/service';

export interface ServiceWithUpsells extends Service {
  upsells?: Array<{
    id: string;
    main_service_id: string;
    upsell_service_id: string;
    discount_percentage: number;
    upsell: Service;
  }>;
}

export interface UpsellItem {
  upsellServiceId: string;
  discountPercentage: number;
}

export interface AddUpsellFormState {
  mainServiceId: string;
  upsellItems: UpsellItem[];
}
