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
      Cities: {
        Row: {
          created_at: string
          id: number
          name: string
          province_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          province_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          province_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      Companies: {
        Row: {
          avatar: string | null
          city_id: number
          created_at: string
          description: string
          email: string
          id: number
          industry_id: number
          linkedin: string | null
          name: string
          phone: string
          province_id: number
          services: string
          size_id: number
          street: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          avatar?: string | null
          city_id: number
          created_at?: string
          description: string
          email: string
          id?: number
          industry_id: number
          linkedin?: string | null
          name: string
          phone: string
          province_id: number
          services: string
          size_id: number
          street?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          avatar?: string | null
          city_id?: number
          created_at?: string
          description?: string
          email?: string
          id?: number
          industry_id?: number
          linkedin?: string | null
          name?: string
          phone?: string
          province_id?: number
          services?: string
          size_id?: number
          street?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "Industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "Sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      Industries: {
        Row: {
          created_at: string
          id: number
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Photos: {
        Row: {
          company_id: number
          created_at: string
          file: string
          id: number
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          file: string
          id?: number
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          file?: string
          id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Companies"
            referencedColumns: ["id"]
          },
        ]
      }
      Provinces: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Sizes: {
        Row: {
          created_at: string
          id: number
          size_range: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          size_range: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          size_range?: string
          updated_at?: string
        }
        Relationships: []
      }
      Users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin: string | null
          phone: string
          photo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin?: string | null
          phone: string
          photo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin?: string | null
          phone?: string
          photo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
