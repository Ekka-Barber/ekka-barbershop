export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          details: string | null
          id: string
          operation: string
          table_name: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          operation: string
          table_name: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          operation?: string
          table_name?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_recurring: boolean | null
          reason: string | null
          recurrence_pattern: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_recurring?: boolean | null
          reason?: string | null
          recurrence_pattern?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_recurring?: boolean | null
          reason?: string | null
          recurrence_pattern?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_settings: {
        Row: {
          created_at: string | null
          id: string
          max_advance_days: number
          min_advance_time_minutes: number
          require_terms_acceptance: boolean | null
          slot_duration_minutes: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_advance_days?: number
          min_advance_time_minutes?: number
          require_terms_acceptance?: boolean | null
          slot_duration_minutes?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_advance_days?: number
          min_advance_time_minutes?: number
          require_terms_acceptance?: boolean | null
          slot_duration_minutes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          appointment_date: string
          appointment_time: string
          barber_id: string | null
          branch_id: string | null
          browser_info: Json | null
          cancellation_reason: string | null
          confirmation_sent: boolean | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          duration_minutes: number
          id: string
          reminder_sent: boolean | null
          services: Json
          source: string | null
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          barber_id?: string | null
          branch_id?: string | null
          browser_info?: Json | null
          cancellation_reason?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          duration_minutes: number
          id?: string
          reminder_sent?: boolean | null
          services: Json
          source?: string | null
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          barber_id?: string | null
          branch_id?: string | null
          browser_info?: Json | null
          cancellation_reason?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          duration_minutes?: number
          id?: string
          reminder_sent?: boolean | null
          services?: Json
          source?: string | null
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      branch_categories: {
        Row: {
          branch_id: string
          branch_name: string | null
          category_id: string
          category_name_ar: string | null
          category_name_en: string | null
        }
        Insert: {
          branch_id: string
          branch_name?: string | null
          category_id: string
          category_name_ar?: string | null
          category_name_en?: string | null
        }
        Update: {
          branch_id?: string
          branch_name?: string | null
          category_id?: string
          category_name_ar?: string | null
          category_name_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_categories_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_categories_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "branch_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
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
          {
            foreignKeyName: "branch_managers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      branch_services: {
        Row: {
          branch_id: string
          branch_name: string | null
          service_id: string
          service_name_ar: string | null
          service_name_en: string | null
        }
        Insert: {
          branch_id: string
          branch_name?: string | null
          service_id: string
          service_name_ar?: string | null
          service_name_en?: string | null
        }
        Update: {
          branch_id?: string
          branch_name?: string | null
          service_id?: string
          service_name_ar?: string | null
          service_name_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_services_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_services_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "branch_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
          working_hours: Json | null
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
          working_hours?: Json | null
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
          working_hours?: Json | null
        }
        Relationships: []
      }
      campaign_costs: {
        Row: {
          campaign_id: string
          campaign_name: string
          created_at: string | null
          currency: string | null
          daily_budget: number | null
          end_date: string
          id: string
          platform: string
          start_date: string
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          created_at?: string | null
          currency?: string | null
          daily_budget?: number | null
          end_date: string
          id?: string
          platform: string
          start_date: string
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          created_at?: string | null
          currency?: string | null
          daily_budget?: number | null
          end_date?: string
          id?: string
          platform?: string
          start_date?: string
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_visits: {
        Row: {
          booking_id: string | null
          bounce: boolean | null
          browser_info: Json | null
          campaign_cost: number | null
          conversion_date: string | null
          converted_to_booking: boolean | null
          device_type: Database["public"]["Enums"]["device_type"] | null
          id: string
          page_url: string | null
          referrer: string | null
          revenue: number | null
          session_duration: unknown | null
          timestamp: string | null
          utm_campaign: string | null
          utm_campaign_id: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          booking_id?: string | null
          bounce?: boolean | null
          browser_info?: Json | null
          campaign_cost?: number | null
          conversion_date?: string | null
          converted_to_booking?: boolean | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          id?: string
          page_url?: string | null
          referrer?: string | null
          revenue?: number | null
          session_duration?: unknown | null
          timestamp?: string | null
          utm_campaign?: string | null
          utm_campaign_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          booking_id?: string | null
          bounce?: boolean | null
          browser_info?: Json | null
          campaign_cost?: number | null
          conversion_date?: string | null
          converted_to_booking?: boolean | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          id?: string
          page_url?: string | null
          referrer?: string | null
          revenue?: number | null
          session_duration?: unknown | null
          timestamp?: string | null
          utm_campaign?: string | null
          utm_campaign_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      cash_deposits: {
        Row: {
          amount: number
          balance: number
          branch_id: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          balance?: number
          branch_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          balance?: number
          branch_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_deposits_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_deposits_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "cash_deposits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_field_settings: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_name: string
          field_type: string
          id: string
          is_required: boolean | null
          is_visible: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_name: string
          field_type: string
          id?: string
          is_required?: boolean | null
          is_visible?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          is_visible?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_sales: {
        Row: {
          base_amount: number
          branch_id: string
          created_at: string | null
          date: string
          id: string
          last_modified_by: string | null
          modification_reason: string | null
          recorded_by_manager_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          base_amount: number
          branch_id: string
          created_at?: string | null
          date: string
          id?: string
          last_modified_by?: string | null
          modification_reason?: string | null
          recorded_by_manager_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          vat_amount: number
        }
        Update: {
          base_amount?: number
          branch_id?: string
          created_at?: string | null
          date?: string
          id?: string
          last_modified_by?: string | null
          modification_reason?: string | null
          recorded_by_manager_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "daily_sales_recorded_by_manager_id_fkey"
            columns: ["recorded_by_manager_id"]
            isOneToOne: false
            referencedRelation: "branch_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_withdrawals: {
        Row: {
          amount: number
          branch_id: string | null
          created_at: string | null
          deposit_id: string
          description: string | null
          id: string
          transaction_id: string
          withdrawal_date: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          created_at?: string | null
          deposit_id: string
          description?: string | null
          id?: string
          transaction_id: string
          withdrawal_date?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          created_at?: string | null
          deposit_id?: string
          description?: string | null
          id?: string
          transaction_id?: string
          withdrawal_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_withdrawals_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_withdrawals_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "deposit_withdrawals_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "cash_deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_withdrawals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_branch_id"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_branch_id"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
        ]
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
          {
            foreignKeyName: "employee_bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
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
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
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
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
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
          {
            foreignKeyName: "employee_holidays_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_holidays_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_holidays_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_holidays_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
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
            foreignKeyName: "employee_loans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "employee_loans_cash_deposit_id_fkey"
            columns: ["cash_deposit_id"]
            isOneToOne: false
            referencedRelation: "cash_deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
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
          {
            foreignKeyName: "fk_employee_sales_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "fk_employee_sales_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "fk_employee_sales_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "fk_employee_sales_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_schedules: {
        Row: {
          branch_id: string | null
          created_at: string | null
          crosses_midnight: boolean | null
          date: string
          day_of_week: number
          employee_id: string
          end_time: number
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          last_modified_by: string | null
          notes: string | null
          reason: string | null
          schedule_label: string | null
          schedule_type: string
          start_time: number
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          crosses_midnight?: boolean | null
          date: string
          day_of_week: number
          employee_id: string
          end_time: number
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          last_modified_by?: string | null
          notes?: string | null
          reason?: string | null
          schedule_label?: string | null
          schedule_type?: string
          start_time: number
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          crosses_midnight?: boolean | null
          date?: string
          day_of_week?: number
          employee_id?: string
          end_time?: number
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          last_modified_by?: string | null
          notes?: string | null
          reason?: string | null
          schedule_label?: string | null
          schedule_type?: string
          start_time?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_schedules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_schedules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_schedules_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "branch_managers"
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
          id: string
          is_archived: boolean
          name: string
          name_ar: string | null
          nationality: string | null
          off_days: string[] | null
          photo_url: string | null
          previous_working_hours: Json | null
          role: Database["public"]["Enums"]["employee_role"]
          salary_plan_id: string | null
          start_date: string | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          annual_leave_quota?: number | null
          branch_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          name: string
          name_ar?: string | null
          nationality?: string | null
          off_days?: string[] | null
          photo_url?: string | null
          previous_working_hours?: Json | null
          role: Database["public"]["Enums"]["employee_role"]
          salary_plan_id?: string | null
          start_date?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          annual_leave_quota?: number | null
          branch_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          name_ar?: string | null
          nationality?: string | null
          off_days?: string[] | null
          photo_url?: string | null
          previous_working_hours?: Json | null
          role?: Database["public"]["Enums"]["employee_role"]
          salary_plan_id?: string | null
          start_date?: string | null
          updated_at?: string
          working_hours?: Json | null
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
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "employees_salary_plan_id_fkey"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["salary_plan_id"]
          },
          {
            foreignKeyName: "employees_salary_plan_id_fkey"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "salary_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_salary_plan"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["salary_plan_id"]
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
      expense_adjustments: {
        Row: {
          adjusted_at: string | null
          adjusted_by: string | null
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          created_at: string | null
          id: string
          new_values: Json
          original_transaction_id: string | null
          previous_values: Json
          reason: string
          transaction_id: string
        }
        Insert: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          created_at?: string | null
          id?: string
          new_values: Json
          original_transaction_id?: string | null
          previous_values: Json
          reason: string
          transaction_id: string
        }
        Update: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_type?: Database["public"]["Enums"]["adjustment_type"]
          created_at?: string | null
          id?: string
          new_values?: Json
          original_transaction_id?: string | null
          previous_values?: Json
          reason?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_adjustments_original_transaction_id_fkey"
            columns: ["original_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_payment_methods: {
        Row: {
          created_at: string
          id: string
          method: Database["public"]["Enums"]["expense_payment_method"]
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["expense_payment_method"]
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["expense_payment_method"]
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_files: {
        Row: {
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
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_name"]
          },
          {
            foreignKeyName: "marketing_files_branch_name_fkey"
            columns: ["branch_name"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["branch_name"]
          },
          {
            foreignKeyName: "marketing_files_branch_name_fkey"
            columns: ["branch_name"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["branch_name"]
          },
        ]
      }
      package_available_services: {
        Row: {
          created_at: string
          display_order: number | null
          enabled: boolean
          id: string
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          enabled?: boolean
          id?: string
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          enabled?: boolean
          id?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_available_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      package_settings: {
        Row: {
          base_service_id: string
          created_at: string
          discount_one_service: number
          discount_three_plus_services: number
          discount_two_services: number
          id: string
          max_services: number | null
          updated_at: string
        }
        Insert: {
          base_service_id: string
          created_at?: string
          discount_one_service: number
          discount_three_plus_services: number
          discount_two_services: number
          id?: string
          max_services?: number | null
          updated_at?: string
        }
        Update: {
          base_service_id?: string
          created_at?: string
          discount_one_service?: number
          discount_three_plus_services?: number
          discount_two_services?: number
          id?: string
          max_services?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_settings_base_service_id_fkey"
            columns: ["base_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_method_fees: {
        Row: {
          created_at: string
          fee_percentage: number
          id: string
          payment_method: Database["public"]["Enums"]["sales_payment_method"]
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_percentage: number
          id?: string
          payment_method: Database["public"]["Enums"]["sales_payment_method"]
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_percentage?: number
          id?: string
          payment_method?: Database["public"]["Enums"]["sales_payment_method"]
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_method_fees_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_fees: {
        Row: {
          base_amount: number
          created_at: string | null
          error_message: string | null
          fee_percentage: number
          id: string
          payment_method:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          sales_transaction_id: string
          status: string | null
          total_amount: number
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          base_amount: number
          created_at?: string | null
          error_message?: string | null
          fee_percentage: number
          id?: string
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          sales_transaction_id: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
          vat_amount: number
        }
        Update: {
          base_amount?: number
          created_at?: string | null
          error_message?: string | null
          fee_percentage?: number
          id?: string
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          sales_transaction_id?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "processing_fees_sales_transaction_id_fkey"
            columns: ["sales_transaction_id"]
            isOneToOne: false
            referencedRelation: "sales_transactions"
            referencedColumns: ["id"]
          },
        ]
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
      recurring_expenses: {
        Row: {
          amount: number
          branch_id: string | null
          category_id: string
          created_at: string
          description: string
          end_date: string | null
          frequency: string
          id: string
          last_generated_date: string | null
          payment_method: Database["public"]["Enums"]["basic_payment_method"]
          start_date: string
          status: string | null
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          branch_id?: string | null
          category_id: string
          created_at?: string
          description: string
          end_date?: string | null
          frequency: string
          id?: string
          last_generated_date?: string | null
          payment_method: Database["public"]["Enums"]["basic_payment_method"]
          start_date: string
          status?: string | null
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category_id?: string
          created_at?: string
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          last_generated_date?: string | null
          payment_method?: Database["public"]["Enums"]["basic_payment_method"]
          start_date?: string
          status?: string | null
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_expenses_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_history: {
        Row: {
          base_salary: number
          bonus: number | null
          change_reason: string | null
          change_type: string
          commission: number | null
          created_at: string | null
          deductions: number | null
          effective_date: string
          employee_id: string
          employee_name: string
          id: string
          loans: number | null
          month: string
          previous_salary_json: Json | null
          salary_plan_id: string | null
          salary_plan_name: string | null
          sales_amount: number | null
          total_salary: number | null
          updated_at: string | null
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          change_reason?: string | null
          change_type: string
          commission?: number | null
          created_at?: string | null
          deductions?: number | null
          effective_date: string
          employee_id: string
          employee_name: string
          id?: string
          loans?: number | null
          month: string
          previous_salary_json?: Json | null
          salary_plan_id?: string | null
          salary_plan_name?: string | null
          sales_amount?: number | null
          total_salary?: number | null
          updated_at?: string | null
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          change_reason?: string | null
          change_type?: string
          commission?: number | null
          created_at?: string | null
          deductions?: number | null
          effective_date?: string
          employee_id?: string
          employee_name?: string
          id?: string
          loans?: number | null
          month?: string
          previous_salary_json?: Json | null
          salary_plan_id?: string | null
          salary_plan_name?: string | null
          sales_amount?: number | null
          total_salary?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_salary_plan_id_fkey"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["salary_plan_id"]
          },
          {
            foreignKeyName: "salary_history_salary_plan_id_fkey"
            columns: ["salary_plan_id"]
            isOneToOne: false
            referencedRelation: "salary_plans"
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
      sales_adjustments: {
        Row: {
          adjusted_at: string | null
          adjusted_by: string | null
          adjustment_type: Database["public"]["Enums"]["transaction_adjustment_type"]
          created_at: string | null
          id: string
          new_values: Json
          original_transaction_id: string | null
          previous_values: Json
          reason: string
          transaction_id: string
        }
        Insert: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_type: Database["public"]["Enums"]["transaction_adjustment_type"]
          created_at?: string | null
          id?: string
          new_values: Json
          original_transaction_id?: string | null
          previous_values: Json
          reason: string
          transaction_id: string
        }
        Update: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_type?: Database["public"]["Enums"]["transaction_adjustment_type"]
          created_at?: string | null
          id?: string
          new_values?: Json
          original_transaction_id?: string | null
          previous_values?: Json
          reason?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_adjustments_original_transaction_id_fkey"
            columns: ["original_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_transactions: {
        Row: {
          amount: number
          base_amount: number
          created_at: string | null
          daily_sales_id: string
          id: string
          payment_method: Database["public"]["Enums"]["sales_payment_method"]
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          amount: number
          base_amount: number
          created_at?: string | null
          daily_sales_id: string
          id?: string
          payment_method: Database["public"]["Enums"]["sales_payment_method"]
          updated_at?: string | null
          vat_amount: number
        }
        Update: {
          amount?: number
          base_amount?: number
          created_at?: string | null
          daily_sales_id?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["sales_payment_method"]
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_daily_sales_id_fkey"
            columns: ["daily_sales_id"]
            isOneToOne: false
            referencedRelation: "daily_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_upsells: {
        Row: {
          created_at: string
          discount_percentage: number
          id: string
          main_service_id: string
          updated_at: string
          upsell_service_id: string
        }
        Insert: {
          created_at?: string
          discount_percentage: number
          id?: string
          main_service_id: string
          updated_at?: string
          upsell_service_id: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          id?: string
          main_service_id?: string
          updated_at?: string
          upsell_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_upsells_main_service_id_fkey"
            columns: ["main_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_upsells_upsell_service_id_fkey"
            columns: ["upsell_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          discount_type: string | null
          discount_value: number | null
          display_order: number | null
          duration: number
          id: string
          mobile_display_order: number | null
          name_ar: string
          name_en: string
          price: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          discount_type?: string | null
          discount_value?: number | null
          display_order?: number | null
          duration: number
          id?: string
          mobile_display_order?: number | null
          name_ar: string
          name_en: string
          price: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          discount_type?: string | null
          discount_value?: number | null
          display_order?: number | null
          duration?: number
          id?: string
          mobile_display_order?: number | null
          name_ar?: string
          name_en?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_receipts: {
        Row: {
          content_type: string
          created_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          size: number
          transaction_id: string
          upload_order: number
        }
        Insert: {
          content_type: string
          created_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          size: number
          transaction_id: string
          upload_order?: number
        }
        Update: {
          content_type?: string
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          size?: number
          transaction_id?: string
          upload_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_receipts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          adjustment_type:
            | Database["public"]["Enums"]["transaction_adjustment_type"]
            | null
          base_amount: number
          branch_id: string | null
          branch_name: string | null
          category: string
          category_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          is_taxable: boolean | null
          last_recalculated_at: string | null
          manager_name: string | null
          needs_recalculation: boolean | null
          original_transaction_id: string | null
          payment_method:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          processing_fee_details: Json | null
          receipt_content_type: string | null
          receipt_filename: string | null
          receipt_size: number | null
          receipt_url: string | null
          recorded_at_branch_id: string | null
          recorded_by_manager_id: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          subcategory_id: string | null
          tags: string[] | null
          template_id: string | null
          total_amount: number
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          vat_amount: number
          vat_included: boolean | null
        }
        Insert: {
          adjustment_type?:
            | Database["public"]["Enums"]["transaction_adjustment_type"]
            | null
          base_amount: number
          branch_id?: string | null
          branch_name?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          is_taxable?: boolean | null
          last_recalculated_at?: string | null
          manager_name?: string | null
          needs_recalculation?: boolean | null
          original_transaction_id?: string | null
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          processing_fee_details?: Json | null
          receipt_content_type?: string | null
          receipt_filename?: string | null
          receipt_size?: number | null
          receipt_url?: string | null
          recorded_at_branch_id?: string | null
          recorded_by_manager_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subcategory_id?: string | null
          tags?: string[] | null
          template_id?: string | null
          total_amount?: number
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          vat_amount?: number
          vat_included?: boolean | null
        }
        Update: {
          adjustment_type?:
            | Database["public"]["Enums"]["transaction_adjustment_type"]
            | null
          base_amount?: number
          branch_id?: string | null
          branch_name?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_taxable?: boolean | null
          last_recalculated_at?: string | null
          manager_name?: string | null
          needs_recalculation?: boolean | null
          original_transaction_id?: string | null
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          processing_fee_details?: Json | null
          receipt_content_type?: string | null
          receipt_filename?: string | null
          receipt_size?: number | null
          receipt_url?: string | null
          recorded_at_branch_id?: string | null
          recorded_by_manager_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subcategory_id?: string | null
          tags?: string[] | null
          template_id?: string | null
          total_amount?: number
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          vat_amount?: number
          vat_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_original_transaction_id_fkey"
            columns: ["original_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recorded_at_branch_id_fkey"
            columns: ["recorded_at_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recorded_at_branch_id_fkey"
            columns: ["recorded_at_branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "transactions_recorded_by_manager_id_fkey"
            columns: ["recorded_by_manager_id"]
            isOneToOne: false
            referencedRelation: "branch_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_elements: {
        Row: {
          action: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          display_name: string
          display_name_ar: string
          display_order: number
          icon: string | null
          id: string
          is_visible: boolean | null
          name: string
          type: string
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          display_name: string
          display_name_ar: string
          display_order: number
          icon?: string | null
          id: string
          is_visible?: boolean | null
          name: string
          type: string
        }
        Update: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          display_name?: string
          display_name_ar?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      vat_entries: {
        Row: {
          base_amount: number
          created_at: string | null
          date: string
          description: string | null
          id: string
          payment_method:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          period: string
          reference_transaction_id: string | null
          source: string
          status: string | null
          transaction_id: string | null
          transaction_type: string | null
          vat_amount: number
          vat_type: string
        }
        Insert: {
          base_amount: number
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          period: string
          reference_transaction_id?: string | null
          source: string
          status?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          vat_amount: number
          vat_type: string
        }
        Update: {
          base_amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          period?: string
          reference_transaction_id?: string | null
          source?: string
          status?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          vat_amount?: number
          vat_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vat_entries_reference_transaction_id_fkey"
            columns: ["reference_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vat_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      campaign_metrics_daily: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          conversions: number | null
          cost: number | null
          day: string | null
          revenue: number | null
          unique_visitors: number | null
          utm_source: string | null
          visits: number | null
        }
        Relationships: []
      }
      employee_documents_with_status: {
        Row: {
          branch_id: string | null
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
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      mv_branch_salary_aggregates: {
        Row: {
          avg_base_salary: number | null
          branch_id: string | null
          branch_name: string | null
          employee_count: number | null
          max_base_salary: number | null
          min_base_salary: number | null
          month: string | null
          total_base_salary: number | null
          total_bonuses: number | null
          total_commissions: number | null
          total_deductions: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      mv_employee_monthly_salary_summary: {
        Row: {
          base_salary: number | null
          branch_id: string | null
          branch_name: string | null
          commission: number | null
          employee_id: string | null
          employee_name: string | null
          month: string | null
          salary_plan_id: string | null
          salary_plan_name: string | null
          salary_plan_type:
            | Database["public"]["Enums"]["salary_calculation_type"]
            | null
          sales_amount: number | null
          total_bonuses: number | null
          total_deductions: number | null
          total_loans: number | null
          total_salary: number | null
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
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      mv_employee_salary_change_history: {
        Row: {
          base_salary: number | null
          bonus: number | null
          change_reason: string | null
          change_type: string | null
          commission: number | null
          deductions: number | null
          effective_date: string | null
          employee_id: string | null
          employee_name: string | null
          month: string | null
          previous_salary_json: Json | null
          salary_change_amount: number | null
          salary_change_percentage: number | null
          total_salary: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_monthly_salary_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "mv_employee_transaction_summary"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_current_month_sales"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_employee_transactions"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      mv_employee_transaction_summary: {
        Row: {
          bonus_count: number | null
          deduction_count: number | null
          employee_id: string | null
          employee_name: string | null
          loan_count: number | null
          month: string | null
          sales_amount: number | null
          total_bonuses: number | null
          total_deductions: number | null
          total_loans: number | null
        }
        Relationships: []
      }
      mv_historical_salary_trends: {
        Row: {
          avg_base_salary: number | null
          avg_bonus: number | null
          avg_commission: number | null
          avg_deductions: number | null
          avg_total_salary: number | null
          employee_count: number | null
          month: string | null
          total_base_salary: number | null
          total_bonus: number | null
          total_commission: number | null
          total_deductions: number | null
          total_salary: number | null
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
          },
        ]
      }
      vw_current_month_sales: {
        Row: {
          branch_id: string | null
          branch_name: string | null
          employee_id: string | null
          employee_name: string | null
          month: string | null
          sales_amount: number | null
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
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "mv_branch_salary_aggregates"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      vw_employee_transactions: {
        Row: {
          current_month_bonuses: number | null
          current_month_deductions: number | null
          current_month_loans: number | null
          employee_id: string | null
          employee_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_commission: {
        Args: { plan_type: string; config_json: Json; sales_amount: number }
        Returns: number
      }
      calculate_employee_salary: {
        Args: { p_employee_id: string; p_month?: string }
        Returns: {
          employee_id: string
          employee_name: string
          base_salary: number
          commission: number
          bonus: number
          deductions: number
          total_salary: number
          month: string
        }[]
      }
      clean_orphaned_receipts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_schedules: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_loan_from_deposit: {
        Args: {
          p_employee_id: string
          p_employee_name: string
          p_amount: number
          p_description: string
          p_date: string
          p_cash_deposit_id: string
        }
        Returns: string
      }
      create_ui_elements_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
      execute_sql_with_result: {
        Args: { sql_query: string }
        Returns: string[]
      }
      generate_15min_slots: {
        Args: { start_time: string; end_time: string }
        Returns: {
          slot_start: number
        }[]
      }
      generate_recurring_expenses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_base_salary_from_config: {
        Args: { plan_type: string; config_json: Json }
        Returns: number
      }
      get_branch_manager_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_device_breakdown: {
        Args: { p_qr_id: string; p_start_date: string }
        Returns: {
          device_type: string
          count: string
        }[]
      }
      get_employee_with_aggregated_json: {
        Args: { p_employee_id: string }
        Returns: Json
      }
      get_owner_access: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_quarter: {
        Args: { date_value: string }
        Returns: string
      }
      get_referrer_breakdown: {
        Args: { p_qr_id: string; p_start_date: string }
        Returns: {
          referrer: string
          count: string
        }[]
      }
      group_employees_by_salary_range: {
        Args: { low_range?: number; mid_range?: number; high_range?: number }
        Returns: {
          salary_range: string
          employee_count: number
          total_salary: number
          avg_salary: number
        }[]
      }
      increment: {
        Args: { x: number }
        Returns: number
      }
      is_time_slot_available: {
        Args: {
          p_employee_id: string
          p_date: string
          p_start_time: number
          p_end_time: number
        }
        Returns: boolean
      }
      json_path_query: {
        Args: {
          table_name: string
          json_column: string
          json_path: string
          comparison_operator: string
          comparison_value: Json
        }
        Returns: {
          id: string
          result: Json
        }[]
      }
      manage_expired_offers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_all_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_campaign_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_branch_salary_aggregates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_employee_monthly_salary_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_employee_salary_change_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_employee_transaction_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_historical_salary_trends: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      round_amount: {
        Args: { amount: number }
        Returns: number
      }
      search_employee_json_data: {
        Args: { search_term: string }
        Returns: {
          id: string
          name: string
          matched_field: string
          matched_value: Json
        }[]
      }
      set_branch_manager_code: {
        Args: { code: string }
        Returns: undefined
      }
      set_owner_access: {
        Args: { value: string }
        Returns: undefined
      }
      time_to_minutes: {
        Args: { time_str: string }
        Returns: number
      }
      transform_employee_json: {
        Args: { employee_id: string; field_name: string; update_value: Json }
        Returns: Json
      }
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
      salary_calculation_type:
        | "fixed"
        | "dynamic_basic"
        | "commission_only"
        | "tiered_commission"
        | "team_commission"
        | "formula"
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
      user_role: "owner" | "employee" | "shop_manager" | "accountant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
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
      salary_calculation_type: [
        "fixed",
        "dynamic_basic",
        "commission_only",
        "tiered_commission",
        "team_commission",
        "formula",
      ],
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
      user_role: ["owner", "employee", "shop_manager", "accountant"],
    },
  },
} as const
