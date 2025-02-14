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
      booking_behavior: {
        Row: {
          created_at: string
          id: string
          step: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          step: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          step?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
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
        ]
      }
      branches: {
        Row: {
          address: string | null
          address_ar: string | null
          created_at: string
          google_maps_url: string | null
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
            foreignKeyName: "cash_deposits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      click_tracking: {
        Row: {
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          element_class: string | null
          element_id: string | null
          id: string
          page_url: string
          screen_height: number
          screen_width: number
          x_coordinate: number
          y_coordinate: number
        }
        Insert: {
          created_at?: string
          device_type: Database["public"]["Enums"]["device_type"]
          element_class?: string | null
          element_id?: string | null
          id?: string
          page_url: string
          screen_height: number
          screen_width: number
          x_coordinate: number
          y_coordinate: number
        }
        Update: {
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          element_class?: string | null
          element_id?: string | null
          id?: string
          page_url?: string
          screen_height?: number
          screen_width?: number
          x_coordinate?: number
          y_coordinate?: number
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
        ]
      }
      employee_sales: {
        Row: {
          created_at: string
          employee_name: string
          id: string
          month: string
          sales_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_name: string
          id?: string
          month: string
          sales_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_name?: string
          id?: string
          month?: string
          sales_amount?: number
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
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
          branch_id: string | null
          created_at: string
          id: string
          name: string
          name_ar: string | null
          nationality: string | null
          off_days: string[] | null
          photo_url: string | null
          role: Database["public"]["Enums"]["employee_role"]
          salary_plan_id: string | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          name: string
          name_ar?: string | null
          nationality?: string | null
          off_days?: string[] | null
          photo_url?: string | null
          role: Database["public"]["Enums"]["employee_role"]
          salary_plan_id?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          name?: string
          name_ar?: string | null
          nationality?: string | null
          off_days?: string[] | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          salary_plan_id?: string | null
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
            referencedRelation: "salary_plans"
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
      expense_templates: {
        Row: {
          amount: number
          branch_id: string | null
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_quick_action: boolean | null
          is_taxable: boolean | null
          name: string
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          subcategory_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          branch_id?: string | null
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_quick_action?: boolean | null
          is_taxable?: boolean | null
          name: string
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          subcategory_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_quick_action?: boolean | null
          is_taxable?: boolean | null
          name?: string
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          subcategory_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_templates_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
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
        ]
      }
      notification_events: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      notification_tracking: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          notification_id: string | null
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_tracking_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_active: string
          p256dh: string
          platform: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_active?: string
          p256dh: string
          platform?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_active?: string
          p256dh?: string
          platform?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
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
            foreignKeyName: "recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_plans: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["salary_calculation_type"]
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["salary_calculation_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["salary_calculation_type"]
          updated_at?: string
        }
        Relationships: []
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
      service_tracking: {
        Row: {
          action: string
          created_at: string
          id: string
          service_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          service_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          service_name?: string
          timestamp?: string
          user_id?: string | null
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
      transactions: {
        Row: {
          amount: number
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
          payment_method:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          receipt_url: string | null
          recorded_at_branch_id: string | null
          recorded_by_manager_id: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          subcategory_id: string | null
          tags: string[] | null
          template_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
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
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          receipt_url?: string | null
          recorded_at_branch_id?: string | null
          recorded_by_manager_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subcategory_id?: string | null
          tags?: string[] | null
          template_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
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
          payment_method?:
            | Database["public"]["Enums"]["sales_payment_method"]
            | null
          receipt_url?: string | null
          recorded_at_branch_id?: string | null
          recorded_by_manager_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subcategory_id?: string | null
          tags?: string[] | null
          template_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
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
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
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
          {
            foreignKeyName: "transactions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "expense_templates"
            referencedColumns: ["id"]
          },
        ]
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
          source: string
          transaction_id: string | null
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
          source: string
          transaction_id?: string | null
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
          source?: string
          transaction_id?: string | null
          vat_amount?: number
          vat_type?: string
        }
        Relationships: [
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
      [_ in never]: never
    }
    Functions: {
      cleanup_invalid_subscriptions: {
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
      generate_recurring_expenses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_branch_manager_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_quarter: {
        Args: {
          date_value: string
        }
        Returns: string
      }
      increment: {
        Args: {
          x: number
        }
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
      manage_expired_offers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_branch_manager_code: {
        Args: {
          code: string
        }
        Returns: undefined
      }
      set_owner_access: {
        Args: {
          value: string
        }
        Returns: undefined
      }
      time_to_minutes: {
        Args: {
          time_str: string
        }
        Returns: number
      }
    }
    Enums: {
      basic_payment_method: "cash" | "bank_transfer"
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
      sales_payment_method:
        | "tabby"
        | "master_card"
        | "visa_card"
        | "mada_card"
        | "cash"
        | "fresha_online"
        | "bank_transfer"
        | "deposit"
      subscription_status: "active" | "inactive"
      transaction_status: "pending" | "completed" | "cancelled"
      transaction_type: "income" | "expense"
      user_role: "owner" | "employee" | "shop_manager" | "accountant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
