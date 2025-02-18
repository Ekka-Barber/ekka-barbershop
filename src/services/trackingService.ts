
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack, cleanupSession } from './tracking/sessionManager';
import { mapPlatformToDeviceType, createTrackingEvent } from './tracking/utils';
import type { 
  BarberSelectionEvent, 
  ServiceDiscoveryEvent,
  DateTimeEvent,
  OfferInteractionEvent,
  MarketingFunnelEvent,
  BranchSelectionEvent,
  InteractionType
} from './tracking/types';
import type { Json } from '@/integrations/supabase/types';

export const trackPageView = async (path: string): Promise<void> => {
  if (!shouldTrack()) return;
  
  try {
    const { error } = await supabase.from('page_views').insert({
      page_url: path,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      entry_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackInteraction = async (
  type: Extract<InteractionType, 
    | 'page_view' 
    | 'barber_select' 
    | 'dialog_open' 
    | 'dialog_close' 
    | 'service_select' 
    | 'branch_select' 
    | 'menu_view' 
    | 'offer_view' 
    | 'button_click' 
    | 'form_interaction' 
    | 'pdf_view' 
    | 'language_switch'>,
  details: Record<string, any> = {}
): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: type,
      interaction_details: details as Json,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      page_url: window.location.pathname,
      element_class: details.element_class,
      element_id: details.element_id,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};

export const trackDateTimeInteraction = async (event: DateTimeEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('datetime_tracking').insert({
      interaction_type: event.interaction_type,
      calendar_view_type: event.calendar_view_type,
      days_in_advance: event.days_in_advance,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      selected_date: event.selected_date,
      selected_time: event.selected_time,
      view_duration_seconds: event.view_duration_seconds,
      calendar_navigation_path: event.calendar_navigation_path,
      preferred_time_slots: event.preferred_time_slots,
      browser_info: event.interaction_details,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking datetime interaction:', error);
  }
};

export const trackMarketingFunnel = async (event: MarketingFunnelEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('marketing_funnel_events').insert({
      funnel_stage: event.funnel_stage,
      interaction_type: 'marketing_funnel',
      time_in_stage: event.time_in_stage,
      conversion_successful: event.conversion_successful,
      drop_off_point: event.drop_off_point,
      entry_point: event.entry_point,
      previous_stage: event.previous_stage,
      interaction_path: event.interaction_path,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking marketing funnel:', error);
  }
};

export const trackBarberInteraction = async (event: BarberSelectionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('barber_selection_events').insert({
      ...event,
      ...createTrackingEvent('barber_select'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking barber interaction:', error);
  }
};

export const trackServiceInteraction = async (event: ServiceDiscoveryEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('service_discovery_events').insert({
      ...event,
      ...createTrackingEvent('service_select'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking service interaction:', error);
  }
};

export const trackOfferInteraction = async (event: OfferInteractionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('offer_interactions').insert({
      ...event,
      ...createTrackingEvent(event.interaction_type),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking offer interaction:', error);
  }
};

