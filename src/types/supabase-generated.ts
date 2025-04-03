export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          address: string;
          address_ar: string;
          is_main: boolean;
          created_at: string;
          updated_at: string;
          whatsapp_number: string;
          google_maps_url: string;
          working_hours: Record<string, string[]> | string;
          google_places_api_key: string | null;
          google_place_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar: string;
          address: string;
          address_ar: string;
          is_main?: boolean;
          created_at?: string;
          updated_at?: string;
          whatsapp_number?: string;
          google_maps_url?: string;
          working_hours?: Record<string, string[]> | string;
          google_places_api_key?: string | null;
          google_place_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          name_ar?: string;
          address?: string;
          address_ar?: string;
          is_main?: boolean;
          created_at?: string;
          updated_at?: string;
          whatsapp_number?: string;
          google_maps_url?: string;
          working_hours?: Record<string, string[]> | string;
          google_places_api_key?: string | null;
          google_place_id?: string | null;
        };
      };
      ui_elements: {
        Row: {
          id: string;
          type: 'button' | 'section';
          name: string;
          display_name: string;
          display_name_ar: string;
          description: string | null;
          description_ar: string | null;
          is_visible: boolean;
          display_order: number;
          icon: string | null;
          action: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ui_elements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['ui_elements']['Row'], 'id' | 'created_at'>>;
      };
    };
    Enums: {
      [_ in never]: never
    };
  };
}
