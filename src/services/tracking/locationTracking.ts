
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, createTrackingEvent } from './utils';
import type { BranchSelectionEvent } from './types';

export const trackBranchSelection = async (event: BranchSelectionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('branch_selection_events').insert({
      ...event,
      ...createTrackingEvent('branch_select'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking branch selection:', error);
  }
};
