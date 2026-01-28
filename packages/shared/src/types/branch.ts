/**
 * Branch types for forms and domain.
 * Branch comes from DB row; BranchFormData is the create/edit form payload.
 */
import type { Branch as BranchRow } from './domains';

export type Branch = BranchRow;

export type BranchFormData = {
  name: string;
  name_ar?: string;
  address?: string;
  address_ar?: string;
  is_main: boolean;
  whatsapp_number?: string;
  google_maps_url?: string;
  google_place_id?: string;
};
