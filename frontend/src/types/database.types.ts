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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          business_date: string
          cash_over: number | null
          cash_short: number | null
          closed_at: string | null
          closed_by: string | null
          closing_cash: number | null
          id: string
          opened_at: string
          opened_by: string | null
          opening_cash: number
          status: string
        }
        Insert: {
          business_date: string
          cash_over?: number | null
          cash_short?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_cash?: number | null
          id?: string
          opened_at?: string
          opened_by?: string | null
          opening_cash?: number
          status: string
        }
        Update: {
          business_date?: string
          cash_over?: number | null
          cash_short?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_cash?: number | null
          id?: string
          opened_at?: string
          opened_by?: string | null
          opening_cash?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_transactions: {
        Row: {
          amount: number
          cash_session_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          cash_session_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          cash_session_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_transactions_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transactions_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "view_cash_report"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "cash_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          archived_at: string | null
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_inventory_lines: {
        Row: {
          added_stock: number
          am_sales: number
          beginning_stock: number
          calculated_ending_stock: number
          created_at: string
          daily_inventory_period_id: string
          id: string
          physical_ending_stock: number | null
          pm_sales: number
          stock_item_id: string
          total_daily_sales: number
          total_stock: number
          updated_at: string
          variance: number | null
          variance_status: string
        }
        Insert: {
          added_stock?: number
          am_sales?: number
          beginning_stock?: number
          calculated_ending_stock?: number
          created_at?: string
          daily_inventory_period_id: string
          id?: string
          physical_ending_stock?: number | null
          pm_sales?: number
          stock_item_id: string
          total_daily_sales?: number
          total_stock?: number
          updated_at?: string
          variance?: number | null
          variance_status?: string
        }
        Update: {
          added_stock?: number
          am_sales?: number
          beginning_stock?: number
          calculated_ending_stock?: number
          created_at?: string
          daily_inventory_period_id?: string
          id?: string
          physical_ending_stock?: number | null
          pm_sales?: number
          stock_item_id?: string
          total_daily_sales?: number
          total_stock?: number
          updated_at?: string
          variance?: number | null
          variance_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_lines_daily_inventory_period_id_fkey"
            columns: ["daily_inventory_period_id"]
            isOneToOne: false
            referencedRelation: "daily_inventory_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_report"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      daily_inventory_periods: {
        Row: {
          business_date: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          location_id: string
          notes: string | null
          opened_at: string
          opened_by: string | null
          reopened_at: string | null
          reopened_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_date: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          location_id: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          reopened_at?: string | null
          reopened_by?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          business_date?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          location_id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          reopened_at?: string | null
          reopened_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_periods_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_periods_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_periods_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_inventory_periods_reopened_by_fkey"
            columns: ["reopened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_configs: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number | null
          discount_type: string
          fixed_discount_amount: number | null
          id: string
          is_active: boolean
          name: string
          requirements: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_type: string
          fixed_discount_amount?: number | null
          id?: string
          is_active?: boolean
          name: string
          requirements?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_type?: string
          fixed_discount_amount?: number | null
          id?: string
          is_active?: boolean
          name?: string
          requirements?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          created_at: string
          created_by: string | null
          discount_amount: number
          discount_percentage: number | null
          discount_type: string
          fixed_discount_amount: number | null
          id: string
          reason: string | null
          reference_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_amount: number
          discount_percentage?: number | null
          discount_type: string
          fixed_discount_amount?: number | null
          id?: string
          reason?: string | null
          reference_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_percentage?: number | null
          discount_type?: string
          fixed_discount_amount?: number | null
          id?: string
          reason?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number
          expense_category_id: string
          expense_date: string
          expense_number: string
          final_amount: number
          id: string
          notes: string | null
          original_amount: number
          payment_method: string | null
          reference_number: string | null
          supplier_or_payee: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number
          expense_category_id: string
          expense_date: string
          expense_number: string
          final_amount: number
          id?: string
          notes?: string | null
          original_amount: number
          payment_method?: string | null
          reference_number?: string | null
          supplier_or_payee?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number
          expense_category_id?: string
          expense_date?: string
          expense_number?: string
          final_amount?: number
          id?: string
          notes?: string | null
          original_amount?: number
          payment_method?: string | null
          reference_number?: string | null
          supplier_or_payee?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_balances: {
        Row: {
          created_at: string
          current_quantity: number
          id: string
          location_id: string
          minimum_stock_level_override: number | null
          reorder_level_override: number | null
          stock_item_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_quantity?: number
          id?: string
          location_id: string
          minimum_stock_level_override?: number | null
          reorder_level_override?: number | null
          stock_item_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_quantity?: number
          id?: string
          location_id?: string
          minimum_stock_level_override?: number | null
          reorder_level_override?: number | null
          stock_item_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_balances_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_report"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_lines: {
        Row: {
          id: string
          line_total: number
          purchase_id: string
          quantity: number
          stock_item_id: string
          unit_cost: number
        }
        Insert: {
          id?: string
          line_total: number
          purchase_id: string
          quantity: number
          stock_item_id: string
          unit_cost: number
        }
        Update: {
          id?: string
          line_total?: number
          purchase_id?: string
          quantity?: number
          stock_item_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_lines_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_lines_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "view_purchase_report"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "purchase_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_report"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          created_by: string | null
          discount_amount: number
          id: string
          notes: string | null
          payment_method: string | null
          purchase_date: string
          purchase_number: string
          status: string
          subtotal: number
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          purchase_date: string
          purchase_number: string
          status: string
          subtotal?: number
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          purchase_date?: string
          purchase_number?: string
          status?: string
          subtotal?: number
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sale_lines: {
        Row: {
          id: string
          line_total: number
          quantity: number
          sale_id: string
          stock_item_id: string
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          quantity: number
          sale_id: string
          stock_item_id: string
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          quantity?: number
          sale_id?: string
          stock_item_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_lines_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_lines_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "view_sales_report"
            referencedColumns: ["sale_id"]
          },
          {
            foreignKeyName: "sale_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_report"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          created_by: string | null
          discount_amount: number
          id: string
          notes: string | null
          payment_method: string | null
          sale_date: string
          sale_number: string
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_date: string
          sale_number: string
          status: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_date?: string
          sale_number?: string
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          archived_at: string | null
          category_id: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_id: string | null
          minimum_stock_level: number
          name: string
          notes: string | null
          reorder_level: number
          selling_price: number
          stock_code: string
          supplier_id: string | null
          tracking_type: string
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          minimum_stock_level?: number
          name: string
          notes?: string | null
          reorder_level?: number
          selling_price?: number
          stock_code: string
          supplier_id?: string | null
          tracking_type: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          minimum_stock_level?: number
          name?: string
          notes?: string | null
          reorder_level?: number
          selling_price?: number
          stock_code?: string
          supplier_id?: string | null
          tracking_type?: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location_id: string
          movement_type: string
          new_quantity: number | null
          notes: string | null
          previous_quantity: number | null
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          stock_item_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id: string
          movement_type: string
          new_quantity?: number | null
          notes?: string | null
          previous_quantity?: number | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          stock_item_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string
          movement_type?: string
          new_quantity?: number | null
          notes?: string | null
          previous_quantity?: number | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          stock_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_report"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      stock_transfer_lines: {
        Row: {
          id: string
          quantity: number
          stock_item_id: string
          transfer_id: string
        }
        Insert: {
          id?: string
          quantity: number
          stock_item_id: string
          transfer_id: string
        }
        Update: {
          id?: string
          quantity?: number
          stock_item_id?: string
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_lines_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_report"
            referencedColumns: ["stock_item_id"]
          },
          {
            foreignKeyName: "stock_transfer_lines_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          destination_location_id: string
          id: string
          notes: string | null
          reason: string | null
          requested_by: string | null
          source_location_id: string
          status: string
          transfer_number: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          destination_location_id: string
          id?: string
          notes?: string | null
          reason?: string | null
          requested_by?: string | null
          source_location_id: string
          status: string
          transfer_number: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          destination_location_id?: string
          id?: string
          notes?: string | null
          reason?: string | null
          requested_by?: string | null
          source_location_id?: string
          status?: string
          transfer_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_discount_policies: {
        Row: {
          created_at: string
          discount_percentage: number | null
          discount_terms: string | null
          discount_type: string
          fixed_discount_amount: number | null
          id: string
          is_active: boolean
          supplier_id: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          discount_terms?: string | null
          discount_type: string
          fixed_discount_amount?: number | null
          id?: string
          is_active?: boolean
          supplier_id: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          discount_terms?: string | null
          discount_type?: string
          fixed_discount_amount?: number | null
          id?: string
          is_active?: boolean
          supplier_id?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_discount_policies_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          archived_at: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          supplier_code: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          supplier_code: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          supplier_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      units_of_measure: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_cash_report: {
        Row: {
          business_date: string | null
          cash_additions: number | null
          cash_over: number | null
          cash_sales: number | null
          cash_short: number | null
          cash_withdrawals: number | null
          closed_at: string | null
          closed_by: string | null
          closed_by_name: string | null
          closing_cash: number | null
          opened_at: string | null
          opened_by: string | null
          opened_by_name: string | null
          opening_cash: number | null
          session_id: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      view_expense_report: {
        Row: {
          category_name: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          description: string | null
          discount_amount: number | null
          expense_category_id: string | null
          expense_date: string | null
          expense_id: string | null
          expense_number: string | null
          final_amount: number | null
          original_amount: number | null
          payment_method: string | null
          supplier_or_payee: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      view_inventory_report: {
        Row: {
          category_name: string | null
          cost_price: number | null
          current_quantity: number | null
          inventory_balance_id: string | null
          inventory_value: number | null
          item_active: boolean | null
          last_updated: string | null
          location_id: string | null
          location_name: string | null
          minimum_stock_level: number | null
          reorder_level: number | null
          selling_price: number | null
          stock_code: string | null
          stock_item_id: string | null
          stock_name: string | null
          stock_status: string | null
          tracking_type: string | null
          unit_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_balances_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      view_purchase_report: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          discount_amount: number | null
          payment_method: string | null
          purchase_date: string | null
          purchase_id: string | null
          purchase_number: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string | null
          supplier_name: string | null
          total_amount: number | null
          total_items: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      view_sales_report: {
        Row: {
          cashier_id: string | null
          cashier_name: string | null
          created_at: string | null
          discount_amount: number | null
          payment_method: string | null
          sale_date: string | null
          sale_id: string | null
          sale_number: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          total_items: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      close_cash_session: {
        Args: { p_actual_closing_cash: number; p_session_id: string }
        Returns: undefined
      }
      complete_stock_transfer: {
        Args: { p_transfer_id: string }
        Returns: undefined
      }
      create_expense: {
        Args: {
          p_cash_session_id: string
          p_category_id: string
          p_description: string
          p_discount_amount: number
          p_expense_date: string
          p_expense_number: string
          p_notes: string
          p_original_amount: number
          p_payment_method: string
          p_supplier_or_payee: string
        }
        Returns: string
      }
      create_purchase: {
        Args: {
          p_discount_amount: number
          p_lines_json: Json
          p_notes: string
          p_payment_method: string
          p_purchase_date: string
          p_purchase_number: string
          p_supplier_id: string
        }
        Returns: string
      }
      create_stock_movement: {
        Args: {
          p_location_id: string
          p_movement_type: string
          p_notes?: string
          p_quantity: number
          p_reason?: string
          p_reference_id?: string
          p_reference_type?: string
          p_stock_item_id: string
        }
        Returns: string
      }
      create_stock_transfer: {
        Args: {
          p_destination_location_id: string
          p_lines_json: Json
          p_notes: string
          p_reason: string
          p_source_location_id: string
          p_transfer_number: string
        }
        Returns: string
      }
      has_any_role: { Args: { role_names: string[] }; Returns: boolean }
      has_role: { Args: { role_name: string }; Returns: boolean }
      inventory_adjust: {
        Args: {
          p_adjustment_type: string
          p_location_id: string
          p_notes?: string
          p_quantity: number
          p_reason: string
          p_stock_item_id: string
        }
        Returns: string
      }
      open_cash_session: {
        Args: { p_business_date: string; p_opening_cash: number }
        Returns: string
      }
      process_sale: {
        Args: {
          p_cash_session_id: string
          p_discount_amount: number
          p_discount_type: string
          p_lines_json: Json
          p_location_id: string
          p_notes: string
          p_payment_method: string
          p_sale_date: string
          p_sale_number: string
        }
        Returns: string
      }
      receive_purchase: {
        Args: { p_location_id: string; p_purchase_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
