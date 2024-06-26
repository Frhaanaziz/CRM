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
      B2B_Companies: {
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
      Cities: {
        Row: {
          country_id: number
          created_at: string
          id: number
          name: string
          province_id: number
          updated_at: string
        }
        Insert: {
          country_id: number
          created_at?: string
          id?: number
          name: string
          province_id: number
          updated_at?: string
        }
        Update: {
          country_id?: number
          created_at?: string
          id?: number
          name?: string
          province_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
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
          city_id: number | null
          company_status_id: number | null
          country_id: number | null
          created_at: string
          id: number
          industry_id: number | null
          linkedin: string | null
          name: string
          phone: string | null
          postal_code: string | null
          primary_contact_id: number | null
          province_id: number | null
          size_id: number | null
          street_1: string | null
          street_2: string | null
          street_3: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          city_id?: number | null
          company_status_id?: number | null
          country_id?: number | null
          created_at?: string
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          primary_contact_id?: number | null
          province_id?: number | null
          size_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          city_id?: number | null
          company_status_id?: number | null
          country_id?: number | null
          created_at?: string
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          primary_contact_id?: number | null
          province_id?: number | null
          size_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Companies_company_status_id_fkey"
            columns: ["company_status_id"]
            isOneToOne: false
            referencedRelation: "Company_Statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companies_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "Contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "Industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "Sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Company_Statuses: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["company_statuses"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["company_statuses"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["company_statuses"]
          updated_at?: string
        }
        Relationships: []
      }
      Contact_Statuses: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["contact_statuses"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["contact_statuses"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["contact_statuses"]
          updated_at?: string
        }
        Relationships: []
      }
      Contacts: {
        Row: {
          city_id: number | null
          company_id: number | null
          contact_status_id: number | null
          country_id: number | null
          created_at: string
          description: string | null
          email: string | null
          facebook: string | null
          first_name: string | null
          id: number
          instagram: string | null
          is_valid_email: boolean | null
          job_title: string | null
          last_name: string | null
          linkedin: string | null
          main_phone: string | null
          mobile_phone: string | null
          postal_code: string | null
          province_id: number | null
          street_1: string | null
          street_2: string | null
          street_3: string | null
          updated_at: string
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          city_id?: number | null
          company_id?: number | null
          contact_status_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
          is_valid_email?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          main_phone?: string | null
          mobile_phone?: string | null
          postal_code?: string | null
          province_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          city_id?: number | null
          company_id?: number | null
          contact_status_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
          is_valid_email?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          main_phone?: string | null
          mobile_phone?: string | null
          postal_code?: string | null
          province_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Contacts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_contact_status_id_fkey"
            columns: ["contact_status_id"]
            isOneToOne: false
            referencedRelation: "Contact_Statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Countries: {
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
      Disqualify_Reasons: {
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
      Industries: {
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
      Invitations: {
        Row: {
          code: string
          created_at: string
          email: string
          id: number
          organization_id: number
          role_id: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: number
          organization_id: number
          role_id: number
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: number
          organization_id?: number
          role_id?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "Roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Lead_Statuses: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["lead_statuses"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["lead_statuses"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["lead_statuses"]
          updated_at?: string
        }
        Relationships: []
      }
      Leads: {
        Row: {
          company_id: number | null
          contact_id: number | null
          created_at: string | null
          disqualify_reason_id: number | null
          id: number
          lead_status_id: number | null
          message: string | null
          rating_id: number | null
          score: number | null
          source_id: number | null
          topic: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: number | null
          contact_id?: number | null
          created_at?: string | null
          disqualify_reason_id?: number | null
          id?: number
          lead_status_id?: number | null
          message?: string | null
          rating_id?: number | null
          score?: number | null
          source_id?: number | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: number | null
          contact_id?: number | null
          created_at?: string | null
          disqualify_reason_id?: number | null
          id?: number
          lead_status_id?: number | null
          message?: string | null
          rating_id?: number | null
          score?: number | null
          source_id?: number | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "Contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_disqualify_reason_id_fkey"
            columns: ["disqualify_reason_id"]
            isOneToOne: false
            referencedRelation: "Disqualify_Reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_lead_status_id_fkey"
            columns: ["lead_status_id"]
            isOneToOne: false
            referencedRelation: "Lead_Statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "Ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "Sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Organizations: {
        Row: {
          city_id: number | null
          country_id: number | null
          created_at: string
          description: string | null
          id: number
          industry_id: number | null
          name: string
          province_id: number | null
          size_id: number | null
          updated_at: string
          website: string
        }
        Insert: {
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          industry_id?: number | null
          name: string
          province_id?: number | null
          size_id?: number | null
          updated_at?: string
          website: string
        }
        Update: {
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          industry_id?: number | null
          name?: string
          province_id?: number | null
          size_id?: number | null
          updated_at?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "Organizations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "Industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "Sizes"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "B2B_Companies"
            referencedColumns: ["id"]
          },
        ]
      }
      Provinces: {
        Row: {
          country_id: number
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          country_id: number
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          country_id?: number
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
        ]
      }
      Ratings: {
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
      Roles: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["role_names"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["role_names"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["role_names"]
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
      Sources: {
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
      Users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin: string | null
          organization_id: number | null
          phone: string
          photo: string | null
          role_id: number
          status: Database["public"]["Enums"]["user_statuses"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin?: string | null
          organization_id?: number | null
          phone: string
          photo?: string | null
          role_id: number
          status?: Database["public"]["Enums"]["user_statuses"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin?: string | null
          organization_id?: number | null
          phone?: string
          photo?: string | null
          role_id?: number
          status?: Database["public"]["Enums"]["user_statuses"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "Roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      company_statuses: "new" | "qualified" | "disqualified"
      contact_statuses: "new" | "qualified" | "disqualified"
      lead_statuses: "new" | "contacted" | "qualified" | "disqualified"
      role_names: "owner" | "admin" | "manager" | "sales"
      user_statuses: "active" | "inactive"
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
