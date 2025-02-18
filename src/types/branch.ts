
export interface WorkingHours {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
  [key: string]: string[]; // Add index signature to make it compatible with useTimeFormatting
}

export interface Branch {
  id: string;
  name: string;
  name_ar: string | null;
  address: string;
  address_ar: string | null;
  working_hours: WorkingHours;
  whatsapp_number?: string | null;
  google_maps_url?: string | null;
}

export interface BranchSelectionEvent {
  interaction_type: 'dialog_open' | 'dialog_close' | 'branch_select';
  source_page: string;
  dialog_open_time?: string;
  dialog_close_time?: string;
  branch_id?: string;
  selected_branch_name?: string;
}
