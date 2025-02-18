
import { BaseInteractionType } from './base';

export interface BarberSelectionEvent extends BaseInteractionType {
  barber_id: string;
  comparison_count?: number;
  time_to_selection_seconds?: number;
  availability_status: boolean;
  view_duration_seconds: number;
  selection_criteria?: {
    availability_based?: boolean;
    nationality_based?: boolean;
    time_slot_based?: boolean;
  };
}

export interface BranchSelectionEvent extends BaseInteractionType {
  branch_id?: string;
  dialog_open_time?: string;
  dialog_close_time?: string;
  selected_branch_name?: string;
  source_page: string;
}

export interface MenuInteractionEvent extends BaseInteractionType {
  menu_file_id?: string;
  view_duration_seconds?: number;
  zoom_actions?: number;
  page_changes?: number;
}

export interface OfferInteractionEvent extends BaseInteractionType {
  offer_id?: string;
  view_duration_seconds?: number;
  source_page?: string;
}
