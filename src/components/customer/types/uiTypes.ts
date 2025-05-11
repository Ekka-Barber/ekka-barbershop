
// Common UI Element interface for customer components
export interface UIElement {
  id: string;
  type: string;
  name: string;
  display_name: string;
  display_name_ar?: string;
  description?: string;
  description_ar?: string;
  icon?: string;
  is_visible?: boolean;
  action?: string;
  [key: string]: any;
}
