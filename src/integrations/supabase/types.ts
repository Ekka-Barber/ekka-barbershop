export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          address: string | null
          address_ar: string | null
          created_at: string
          google_maps_url: string | null
          google_place_id: string | null
          google_places_api_key: string | null
          id: string
          is_main: boolean | null
          name: string
          name_ar: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          created_at?: string
          google_maps_url?: string | null
          google_place_id?: string | null
          google_places_api_key?: string | null
          id?: string
          is_main?: boolean | null
          name: string
          name_ar?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          created_at?: string
          google_maps_url?: string | null
          google_place_id?: string | null
          google_places_api_key?: string | null
          id?: string
          is_main?: boolean | null
          name?: string
          name_ar?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          annual_leave_quota: number | null
          branch_id: string | null
          created_at: string
          email: string | null
          end_date: string | null
          id: string
          is_archived: boolean
          name: string
          name_ar: string | null
          nationality: string | null
          off_days: string[] | null
          photo_url: string | null
          role: Database["public"]["Enums"]["employee_role"]
          salary_plan_id: string | null
          sponsor_id: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          annual_leave_quota?: number | null
          branch_id?: string | null
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          is_archived?: boolean
          name: string
          name_ar?: string | null
          nationality?: string | null
          off_days?: string[] | null
          photo_url?: string | null
          role: Database["public"]["Enums"]["employee_role"]
          salary_plan_id?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          annual_leave_quota?: number | null
          branch_id?: string | null
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          name_ar?: string | null
          nationality?: string | null
          off_days?: string[] | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          salary_plan_id?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      google_reviews: {
        Row: {
          author_name: string
          branch_id: string | null
          cached_avatar_url: string | null
          created_at: string
          google_place_id: string
          google_review_time: number
          id: string
          is_active: boolean
          language: string | null
          last_synced_at: string
          original_text: string
          profile_photo_url: string | null
          rating: number
          relative_time_description: string | null
          text: string
          updated_at: string
        }
        Insert: {
          author_name: string
          branch_id?: string | null
          cached_avatar_url?: string | null
          created_at?: string
          google_place_id: string
          google_review_time: number
          id?: string
          is_active?: boolean
          language?: string | null
          last_synced_at?: string
          original_text: string
          profile_photo_url?: string | null
          rating: number
          relative_time_description?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          branch_id?: string | null
          cached_avatar_url?: string | null
          created_at?: string
          google_place_id?: string
          google_review_time?: number
          id?: string
          is_active?: boolean
          language?: string | null
          last_synced_at?: string
          original_text?: string
          profile_photo_url?: string | null
          rating?: number
          relative_time_description?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_reviews_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      marketing_files: {
        Row: {
          branch_id: string | null
          branch_name: string | null
          branch_name_ar: string | null
          category: string
          created_at: string
          display_order: number | null
          end_date: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          is_active: boolean | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          branch_name?: string | null
          branch_name_ar?: string | null
          category: string
          created_at?: string
          display_order?: number | null
          end_date?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          branch_name?: string | null
          branch_name_ar?: string | null
          category?: string
          created_at?: string
          display_order?: number | null
          end_date?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_marketing_files_branch_id"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      owner_access: {
        Row: {
          access_code: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          access_code: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          qr_id: string
          referrer: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          qr_id: string
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          qr_id?: string
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          }
        ]
      }
      review_avatar_cache: {
        Row: {
          access_count: number
          author_name: string | null
          cached_avatar_url: string
          created_at: string
          google_avatar_url: string
          id: string
          last_accessed_at: string
          last_refreshed_at: string | null
          refresh_interval_days: number | null
          updated_at: string
        }
        Insert: {
          access_count?: number
          author_name?: string | null
          cached_avatar_url: string
          created_at?: string
          google_avatar_url: string
          id?: string
          last_accessed_at?: string
          last_refreshed_at?: string | null
          refresh_interval_days?: number | null
          updated_at?: string
        }
        Update: {
          access_count?: number
          author_name?: string | null
          cached_avatar_url?: string
          created_at?: string
          google_avatar_url?: string
          id?: string
          last_accessed_at?: string
          last_refreshed_at?: string | null
          refresh_interval_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ui_elements: {
        Row: {
          action: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          display_name: string
          display_name_ar: string
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          display_name: string
          display_name_ar: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          action?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          display_name?: string
          display_name_ar?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      qr_scan_counts_daily: {
        Row: {
          qr_id: string | null
          scan_count: number | null
          scan_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      qr_scan_counts_daily: {
        Row: {
          qr_id: string | null
          scan_count: number | null
          scan_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      get_device_breakdown: {
        Args: { p_qr_id: string; p_start_date: string }
        Returns: { count: string; device_type: string }[]
      }
      get_owner_access: { Args: never; Returns: string }
      get_referrer_breakdown: {
        Args: { p_qr_id: string; p_start_date: string }
        Returns: { count: string; referrer: string }[]
      }
      is_owner_access_code: { Args: { code: string }; Returns: boolean }
      set_owner_access: { Args: { value: string }; Returns: undefined }
    }
    Enums: {
      device_type: "mobile" | "tablet" | "desktop"
      employee_role: "manager" | "barber" | "receptionist" | "cleaner" | "massage_therapist" | "hammam_specialist"
      expense_payment_method: "cash" | "deposit" | "bank_transfer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      device_type: ["mobile", "tablet", "desktop"],
      employee_role: ["manager", "barber", "receptionist", "cleaner", "massage_therapist", "hammam_specialist"],
      expense_payment_method: ["cash", "deposit", "bank_transfer"],
    },
  },
} as const