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
          id: string
          is_main: boolean | null
          name: string
          name_ar: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          created_at?: string
          id?: string
          is_main?: boolean | null
          name: string
          name_ar?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          created_at?: string
          id?: string
          is_main?: boolean | null
          name?: string
          name_ar?: string | null
          updated_at?: string
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
          date?: string
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
      employees: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          name: string
          name_ar: string | null
          off_days: string[] | null
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
          off_days?: string[] | null
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
          off_days?: string[] | null
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
      marketing_files: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
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
      services: {
        Row: {
          category_id: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          duration: number
          id: string
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
          duration: number
          id?: string
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
          duration?: number
          id?: string
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
          subcategory_id: string | null
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
          subcategory_id?: string | null
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
          subcategory_id?: string | null
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_recurring_expenses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_branch_manager_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment: {
        Args: {
          x: number
        }
        Returns: number
      }
      set_branch_manager_code: {
        Args: {
          code: string
        }
        Returns: undefined
      }
    }
    Enums: {
      basic_payment_method: "cash" | "bank_transfer"
      employee_role:
        | "manager"
        | "barber"
        | "receptionist"
        | "cleaner"
        | "massage_therapist"
        | "hammam_specialist"
      expense_payment_method: "cash" | "deposit" | "bank_transfer"
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
