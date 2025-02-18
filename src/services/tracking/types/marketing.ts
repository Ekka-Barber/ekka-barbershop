
import { BaseInteractionType } from './base';

export type MarketingFunnelStage = 
  | 'landing' 
  | 'service_browse' 
  | 'datetime_select' 
  | 'barber_select' 
  | 'booking_complete'
  | 'offer_view';

export interface MarketingFunnelEvent extends BaseInteractionType {
  funnel_stage: MarketingFunnelStage;
  time_in_stage: number;
  conversion_successful: boolean;
  drop_off_point: boolean;
  entry_point: string;
  previous_stage?: string;
  interaction_path: {
    path: string[];
    timestamps: number[];
  };
}
