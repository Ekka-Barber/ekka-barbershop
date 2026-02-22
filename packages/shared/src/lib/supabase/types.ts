export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      branch_managers: {
        Row: {
          access_code: string
          branch_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          access_code: string
          branch_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          branch_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_managers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
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
      document_types: {
        Row: {
          code: string
          color: string | null
          created_at: string
          default_duration_months: number
          display_order: number
          id: string
          is_active: boolean
          name_ar: string
          name_en: string | null
          notification_threshold_days: number
          requires_document_number: boolean
          updated_at: string
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string
          default_duration_months?: number
          display_order?: number
          id?: string
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          notification_threshold_days?: number
          requires_document_number?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string
          default_duration_months?: number
          display_order?: number
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          notification_threshold_days?: number
          requires_document_number?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      employee_bonuses: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          employee_id: string
          employee_name: string
          id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date: string
          description: string
          employee_id: string
          employee_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          employee_id?: string
          employee_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_deductions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          employee_id: string
          employee_name: string
          id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date: string
          description: string
          employee_id: string
          employee_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          employee_id?: string
          employee_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string
          document_name: string
          document_number: string | null
          document_type: string
          document_url: string | null
          duration_months: number
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          notes: string | null
          notification_threshold_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_number?: string | null
          document_type: string
          document_url?: string | null
          duration_months?: number
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          notes?: string | null
          notification_threshold_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_number?: string | null
          document_type?: string
          document_url?: string | null
          duration_months?: number
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          notification_threshold_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_holidays: {
        Row: {
          created_at: string | null
          date: string
          duration_days: number | null
          employee_id: string | null
          end_date: string | null
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          duration_days?: number | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_days?: number | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_holidays_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_loans: {
        Row: {
          amount: number
          branch_id: string | null
          cash_deposit_id: string | null
          created_at: string
          date: string
          description: string
          employee_id: string
          employee_name: string
          id: string
          source: string
          updated_at: string
        }
        Insert: {
          amount?: number
          branch_id?: string | null
          cash_deposit_id?: string | null
          created_at?: string
          date?: string
          description: string
          employee_id: string
          employee_name: string
          id?: string
          source?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          cash_deposit_id?: string | null
          created_at?: string
          date?: string
          description?: string
          employee_id?: string
          employee_name?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_loans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sales: {
        Row: {
          created_at: string
          employee_id: string | null
          employee_name: string
          id: string
          month: string
          sales_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          employee_name: string
          id?: string
          month: string
          sales_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          month?: string
          sales_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee_sales_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
          },
          {
            foreignKeyName: "employees_salary_plan_id_fkey"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "salary_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_salary_plan"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "salary_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      google_reviews: {
        Row: {
          author_name: string
          branch_id: string | null
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
          },
        ]
      }
      hr_access: {
        Row: {
          access_code: string | null
          access_code_hash: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          access_code?: string | null
          access_code_hash: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string | null
          access_code_hash?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
          },
          {
            foreignKeyName: "marketing_files_branch_name_fkey"
            columns: ["branch_name"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "marketing_files_branch_name_fkey"
            columns: ["branch_name"]
            isOneToOne: false
            referencedRelation: "employee_documents_with_status"
            referencedColumns: ["branch_name"]
          },
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
          },
        ]
      }
      salary_plans: {
        Row: {
          config: Json
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          name: string
          name_ar: string | null
          type: Database["public"]["Enums"]["salary_calculation_type"]
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          name: string
          name_ar?: string | null
          type: Database["public"]["Enums"]["salary_calculation_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          type?: Database["public"]["Enums"]["salary_calculation_type"]
          updated_at?: string
        }
        Relationships: []
      }
      insurance_companies: {
        Row: {
          id: string
          name: string
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_hospitals: {
        Row: {
          id: string
          company_id: string
          name: string
          city: string
          google_maps_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          city: string
          google_maps_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          city?: string
          google_maps_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_hospitals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_insurance: {
        Row: {
          id: string
          employee_id: string
          company_id: string
          expiry_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          company_id: string
          expiry_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          company_id?: string
          expiry_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_insurance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_insurance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          cr_number: string
          created_at: string | null
          id: string
          name_ar: string
          unified_number: string
          updated_at: string | null
        }
        Insert: {
          cr_number: string
          created_at?: string | null
          id?: string
          name_ar: string
          unified_number: string
          updated_at?: string | null
        }
        Update: {
          cr_number?: string
          created_at?: string | null
          id?: string
          name_ar?: string
          unified_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sponsor_document_types: {
        Row: {
          id: string
          code: string
          name_en: string
          name_ar: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name_en: string
          name_ar: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name_en?: string
          name_ar?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsor_documents: {
        Row: {
          id: string
          sponsor_id: string
          document_type_id: string
          file_url: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          issue_date: string
          expiry_date: string
          duration_months: number
          notification_threshold_days: number
          notes: string | null
          is_active: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          document_type_id: string
          file_url: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          issue_date: string
          expiry_date: string
          duration_months?: number
          notification_threshold_days?: number
          notes?: string | null
          is_active?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sponsor_id?: string
          document_type_id?: string
          file_url?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          issue_date?: string
          expiry_date?: string
          duration_months?: number
          notification_threshold_days?: number
          notes?: string | null
          is_active?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_documents_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "sponsor_document_types"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      employee_documents_with_status: {
        Row: {
          branch_id: string | null
          branch_name: string | null
          created_at: string | null
          days_remaining: number | null
          document_name: string | null
          document_number: string | null
          document_type: string | null
          document_url: string | null
          duration_months: number | null
          employee_id: string | null
          employee_name: string | null
          expiry_date: string | null
          id: string | null
          issue_date: string | null
          notes: string | null
          notification_threshold_days: number | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
          },
        ]
      }
    }
    Functions: {
      calculate_commission: {
        Args: { config_json: Json; plan_type: string; sales_amount: number }
        Returns: number
      }
      calculate_comprehensive_salary: {
        Args: { p_employee_id: string; p_month: number; p_year: number }
        Returns: {
          base_salary: number
          employee_id: string
          gross_salary: number
          net_salary: number
          total_bonuses: number
          total_commissions: number
          total_deductions: number
          vat_amount: number
        }[]
      }
      calculate_employee_commission: {
        Args: { p_employee_id: string; p_month: number; p_year: number }
        Returns: number
      }
      calculate_employee_deductions: {
        Args: {
          p_employee_id: string
          p_gross_salary: number
          p_month: number
          p_year: number
        }
        Returns: number
      }
      calculate_employee_salary: {
        Args: { p_employee_id: string; p_month?: string }
        Returns: {
          base_salary: number
          bonus: number
          commission: number
          deductions: number
          employee_id: string
          employee_name: string
          month: string
          total_salary: number
        }[]
      }
      calculate_salary_vat: {
        Args: { p_employee_id: string; p_month: number; p_year: number }
        Returns: number
      }
      can_access_business_data: { Args: never; Returns: boolean }
      clean_orphaned_receipts: { Args: never; Returns: undefined }
      cleanup_old_schedules: { Args: never; Returns: number }
      clear_access_codes: { Args: never; Returns: undefined }
      complete_idempotency: {
        Args: {
          p_key: string
          p_operation_id: string
          p_result_summary?: Json
          p_scope: string
        }
        Returns: undefined
      }
      complete_submission: {
        Args: { p_id: string; p_result?: Json }
        Returns: boolean
      }
      create_loan_from_deposit: {
        Args: {
          p_amount: number
          p_cash_deposit_id: string
          p_date: string
          p_description: string
          p_employee_id: string
          p_employee_name: string
        }
        Returns: string
      }
      create_ui_elements_table_if_not_exists: {
        Args: never
        Returns: undefined
      }
      deactivate_payment_method_bank: {
        Args: { p_branch_id: string; p_payment_method_id: string }
        Returns: undefined
      }
      dequeue_submission: {
        Args: { p_lease_seconds?: number; p_now?: string }
        Returns: {
          branch_id: string
          id: string
          idempotency_key: string
          payload: Json
          submission_type: string
        }[]
      }
      detect_access_role: { Args: { code: string }; Returns: string }
      enqueue_submission: {
        Args: {
          p_branch_id: string
          p_idempotency_key?: string
          p_max_retries?: number
          p_payload: Json
          p_scheduled_at?: string
          p_submission_type: string
        }
        Returns: string
      }
      execute_sql: { Args: { sql_query: string }; Returns: undefined }
      execute_sql_with_result: {
        Args: { sql_query: string }
        Returns: string[]
      }
      fail_submission: {
        Args: { p_error: Json; p_id: string; p_retryable?: boolean }
        Returns: string
      }
      generate_15min_slots: {
        Args: { end_time: string; start_time: string }
        Returns: {
          slot_start: number
        }[]
      }
      generate_recurring_expenses: { Args: never; Returns: undefined }
      generate_salary_vat_report: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: string
      }
      get_base_salary_from_config: {
        Args: { config_json: Json; plan_type: string }
        Returns: number
      }
      get_branch_manager_code: { Args: never; Returns: string }
      get_branch_tag_option: {
        Args: { p_branch_id: string; p_tag_id: string }
        Returns: string
      }
      get_branch_tag_status: {
        Args: { p_branch_id: string; p_tag_id: string }
        Returns: Json
      }
      get_branch_tags: {
        Args: { p_branch_id: string }
        Returns: {
          tag_id: string
          tag_option_id: string
        }[]
      }
      get_category_coa_mapping: {
        Args: { p_category_id: string; p_subcategory_id: string }
        Returns: {
          account_id: string
          id: string
          is_active: boolean
        }[]
      }
      get_device_breakdown: {
        Args: { p_qr_id: string; p_start_date: string }
        Returns: {
          count: string
          device_type: string
        }[]
      }
      get_employee_salary_data: {
        Args: { p_employee_ids: string[]; p_month_year: string }
        Returns: {
          base_salary: number
          commission_amount: number
          employee_id: string
          employee_name: string
          salary_plan_id: string
          salary_plan_name: string
          sales_amount: number
          total_bonuses: number
          total_deductions: number
          total_loans: number
        }[]
      }
      get_employee_salary_history: {
        Args: { p_employee_id: string; p_months_back?: number }
        Returns: {
          base_salary: number
          bonuses: number
          commissions: number
          deductions: number
          gross_salary: number
          month: number
          net_salary: number
          payment_status: string
          year: number
        }[]
      }
      get_employee_with_aggregated_json: {
        Args: { p_employee_id: string }
        Returns: Json
      }
      get_feature_flags: {
        Args: { p_branch_id?: string; p_user_id?: string }
        Returns: {
          enabled: boolean
          flag_key: string
          source: string
        }[]
      }
      get_idempotent_result: {
        Args: { p_key: string; p_scope: string }
        Returns: {
          created_at: string
          operation_id: string
          result_summary: Json
          status: string
          updated_at: string
        }[]
      }
      get_missing_branch_tag_options: {
        Args: { p_tag_id: string }
        Returns: {
          branch_id: string
          suggested_option_name: string
        }[]
      }
      get_owner_access: { Args: never; Returns: string }
      get_payment_bank_account: {
        Args: { p_branch_id: string; p_payment_method_id: string }
        Returns: string
      }
      get_pool_status: {
        Args: never
        Returns: {
          branch_id: string
          branch_name: string
          cash_balance: number
          fresha_balance: number
          last_updated: string
        }[]
      }
      get_quarter: { Args: { date_value: string }; Returns: string }
      get_queue_stats: { Args: never; Returns: Json }
      get_referrer_breakdown: {
        Args: { p_qr_id: string; p_start_date: string }
        Returns: {
          count: string
          referrer: string
        }[]
      }
      get_salary_period_summary: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          paid_employees: number
          pending_employees: number
          total_base_salary: number
          total_bonuses: number
          total_commissions: number
          total_deductions: number
          total_employees: number
          total_gross_salary: number
          total_net_salary: number
          total_vat: number
        }[]
      }
      get_selected_branch: { Args: never; Returns: string }
      get_sync_health: {
        Args: {
          p_branch_ids?: string[]
          p_payment_method_ids?: string[]
          p_required_tax_codes?: string[]
        }
        Returns: Json
      }
      get_tax_id: { Args: { p_app_tax_code: string }; Returns: string }
      group_employees_by_salary_range: {
        Args: { high_range?: number; low_range?: number; mid_range?: number }
        Returns: {
          avg_salary: number
          employee_count: number
          salary_range: string
          total_salary: number
        }[]
      }
      increment: { Args: { x: number }; Returns: number }
      initialize_pool_balances: {
        Args: never
        Returns: {
          branch_id: string
          branch_name: string
          status: string
        }[]
      }
      is_owner_access_code: { Args: { code: string }; Returns: boolean }
      is_time_slot_available: {
        Args: {
          p_date: string
          p_employee_id: string
          p_end_time: number
          p_start_time: number
        }
        Returns: boolean
      }
      json_path_query: {
        Args: {
          comparison_operator: string
          comparison_value: Json
          json_column: string
          json_path: string
          table_name: string
        }
        Returns: {
          id: string
          result: Json
        }[]
      }
      manage_expired_offers: { Args: never; Returns: undefined }
      normalize_access_code: { Args: { code: string }; Returns: string }
      refresh_all_materialized_views: { Args: never; Returns: undefined }
      refresh_campaign_metrics: { Args: never; Returns: undefined }
      refresh_mv_branch_salary_aggregates: { Args: never; Returns: undefined }
      refresh_mv_employee_monthly_salary_summary: {
        Args: never
        Returns: undefined
      }
      refresh_mv_employee_salary_change_history: {
        Args: never
        Returns: undefined
      }
      refresh_mv_employee_transaction_summary: {
        Args: never
        Returns: undefined
      }
      refresh_mv_historical_salary_trends: { Args: never; Returns: undefined }
      refresh_salary_summary_view: { Args: never; Returns: undefined }
      request_access_code: { Args: never; Returns: string }
      request_access_role: { Args: never; Returns: string }
      reserve_idempotency: {
        Args: { p_key: string; p_scope: string; p_ttl_seconds?: number }
        Returns: boolean
      }
      round_amount: { Args: { amount: number }; Returns: number }
      search_employee_json_data: {
        Args: { search_term: string }
        Returns: {
          id: string
          matched_field: string
          matched_value: Json
          name: string
        }[]
      }
      set_branch_manager_code: {
        Args: { access_code: string }
        Returns: undefined
      }
      set_hr_access: { Args: { code: string }; Returns: undefined }
      set_owner_access: { Args: { code: string }; Returns: undefined }
      set_selected_branch: { Args: { branch_id: string }; Returns: undefined }
      submit_monthly_salaries: {
        Args: {
          p_branch_expenses: Json
          p_individual_records: Json
          p_submission_metadata: Json
        }
        Returns: string
      }
      suggest_branch_tag_option_name: {
        Args: { p_branch_id: string }
        Returns: string
      }
      time_to_minutes: { Args: { time_str: string }; Returns: number }
      transform_employee_json: {
        Args: { employee_id: string; field_name: string; update_value: Json }
        Returns: Json
      }
      upsert_branch_tag_option: {
        Args: {
          p_branch_id: string
          p_created_by?: string
          p_tag_id: string
          p_tag_option_id: string
        }
        Returns: string
      }
      upsert_category_coa_mapping: {
        Args: {
          p_account_id: string
          p_category_id: string
          p_is_active?: boolean
          p_subcategory_id: string
        }
        Returns: string
      }
      upsert_feature_flag: {
        Args: { p_description?: string; p_enabled: boolean; p_flag_key: string }
        Returns: undefined
      }
      upsert_feature_flag_override: {
        Args: {
          p_branch_id?: string
          p_enabled: boolean
          p_flag_key: string
          p_user_id?: string
        }
        Returns: undefined
      }
      upsert_payment_method_bank: {
        Args: {
          p_bank_account_id: string
          p_branch_id?: string
          p_is_active?: boolean
          p_payment_method_id: string
        }
        Returns: string
      }
      upsert_tax_mapping: {
        Args: {
          p_app_tax_code: string
          p_is_active?: boolean
          p_zoho_tax_id: string
        }
        Returns: string
      }
      validate_hr_access: { Args: { code: string }; Returns: boolean }
      validate_salary_payment_config: {
        Args: { p_employee_id: string }
        Returns: {
          is_valid: boolean
          missing_config: string[]
          warnings: string[]
        }[]
      }
      validate_submission_prerequisites: {
        Args: {
          p_branch_id: string
          p_employee_ids: string[]
          p_month_year: string
        }
        Returns: {
          employee_id: string
          error_message: string
          is_valid: boolean
          issue_type: string
        }[]
      }
      verify_hr_access: { Args: { code: string }; Returns: boolean }
      verify_manager_access: { Args: { code: string }; Returns: boolean }
      verify_owner_access: { Args: { code: string }; Returns: boolean }
    }
    Enums: {
      adjustment_type: "correction" | "refund"
      basic_payment_method: "cash" | "bank_transfer"
      calendar_view_type: "month" | "week" | "quick_select"
      device_type: "mobile" | "tablet" | "desktop"
      employee_role:
        | "manager"
        | "barber"
        | "receptionist"
        | "cleaner"
        | "massage_therapist"
        | "hammam_specialist"
      expense_payment_method: "cash" | "deposit" | "bank_transfer"
      payment_method_type: "cash" | "deposit" | "bank_transfer"
      rent_expense_type: "cleaning" | "other" | "commission"
      salary_calculation_type: "fixed" | "dynamic_basic"
      sales_payment_method:
        | "tabby"
        | "master_card"
        | "visa_card"
        | "mada_card"
        | "cash"
        | "fresha_online"
        | "bank_transfer"
        | "deposit"
      transaction_adjustment_type: "correction" | "refund"
      transaction_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "adjusted"
        | "refunded"
        | "void"
      transaction_type: "income" | "expense"
      user_role: "owner" | "employee" | "shop_manager" | "accountant" | "hr"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

type _Tables<
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

type _TablesInsert<
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

type _TablesUpdate<
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

type _Enums<
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

type _CompositeTypes<
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

const _Constants = {
  public: {
    Enums: {
      adjustment_type: ["correction", "refund"],
      basic_payment_method: ["cash", "bank_transfer"],
      calendar_view_type: ["month", "week", "quick_select"],
      device_type: ["mobile", "tablet", "desktop"],
      employee_role: [
        "manager",
        "barber",
        "receptionist",
        "cleaner",
        "massage_therapist",
        "hammam_specialist",
      ],
      expense_payment_method: ["cash", "deposit", "bank_transfer"],
      payment_method_type: ["cash", "deposit", "bank_transfer"],
      rent_expense_type: ["cleaning", "other", "commission"],
      salary_calculation_type: ["fixed", "dynamic_basic"],
      sales_payment_method: [
        "tabby",
        "master_card",
        "visa_card",
        "mada_card",
        "cash",
        "fresha_online",
        "bank_transfer",
        "deposit",
      ],
      transaction_adjustment_type: ["correction", "refund"],
      transaction_status: [
        "pending",
        "completed",
        "cancelled",
        "adjusted",
        "refunded",
        "void",
      ],
      transaction_type: ["income", "expense"],
      user_role: ["owner", "employee", "shop_manager", "accountant", "hr"],
    },
  },
} as const
