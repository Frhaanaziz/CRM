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
          city_id: number | null
          company_id: number | null
          country_id: number | null
          created_at: string
          description: string | null
          email: string | null
          founded: string | null
          id: number
          industry_id: number | null
          linkedin: string | null
          location: string | null
          name: string
          phone: string | null
          province_id: number | null
          size_id: number | null
          specialities: string | null
          tagline: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          avatar?: string | null
          city_id?: number | null
          company_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded?: string | null
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          location?: string | null
          name: string
          phone?: string | null
          province_id?: number | null
          size_id?: number | null
          specialities?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          avatar?: string | null
          city_id?: number | null
          company_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded?: string | null
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          province_id?: number | null
          size_id?: number | null
          specialities?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "B2B_Companies_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
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
      B2B_Contacts: {
        Row: {
          city_id: number | null
          company_id: number
          country_id: number | null
          created_at: string
          description: string | null
          email: string
          facebook: string | null
          first_name: string | null
          id: number
          instagram: string | null
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
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          city_id?: number | null
          company_id: number
          country_id?: number | null
          created_at?: string
          description?: string | null
          email: string
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
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
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          city_id?: number | null
          company_id?: number
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
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
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_contacts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "B2B_Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contacts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contacts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
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
      Close_Reasons: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["close_reasons"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["close_reasons"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["close_reasons"]
          updated_at?: string
        }
        Relationships: []
      }
      Companies: {
        Row: {
          city_id: number | null
          company_status_id: number
          country_id: number | null
          created_at: string
          id: number
          industry_id: number | null
          linkedin: string | null
          name: string
          organization_id: number
          phone: string | null
          postal_code: string | null
          primary_contact_id: number | null
          province_id: number | null
          size_id: number | null
          street_1: string | null
          street_2: string | null
          street_3: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          city_id?: number | null
          company_status_id: number
          country_id?: number | null
          created_at?: string
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          name: string
          organization_id: number
          phone?: string | null
          postal_code?: string | null
          primary_contact_id?: number | null
          province_id?: number | null
          size_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          city_id?: number | null
          company_status_id?: number
          country_id?: number | null
          created_at?: string
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          name?: string
          organization_id?: number
          phone?: string | null
          postal_code?: string | null
          primary_contact_id?: number | null
          province_id?: number | null
          size_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id?: string
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
            foreignKeyName: "Companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
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
          company_id: number
          contact_status_id: number
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
          organization_id: number
          postal_code: string | null
          province_id: number | null
          street_1: string | null
          street_2: string | null
          street_3: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          city_id?: number | null
          company_id: number
          contact_status_id: number
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
          organization_id: number
          postal_code?: string | null
          province_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          city_id?: number | null
          company_id?: number
          contact_status_id?: number
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
          organization_id?: number
          postal_code?: string | null
          province_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          user_id?: string
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
            foreignKeyName: "Contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
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
      Currencies: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["currencies"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["currencies"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["currencies"]
          updated_at?: string
        }
        Relationships: []
      }
      Disqualify_Reasons: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["disqualify_reasons"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["disqualify_reasons"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["disqualify_reasons"]
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
          company_id: number
          contact_id: number
          created_at: string | null
          disqualify_reason_id: number | null
          id: number
          lead_status_id: number
          message: string | null
          organization_id: number
          rating_id: number
          score: number | null
          source_id: number
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: number
          contact_id: number
          created_at?: string | null
          disqualify_reason_id?: number | null
          id?: number
          lead_status_id: number
          message?: string | null
          organization_id: number
          rating_id: number
          score?: number | null
          source_id: number
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: number
          contact_id?: number
          created_at?: string | null
          disqualify_reason_id?: number | null
          id?: number
          lead_status_id?: number
          message?: string | null
          organization_id?: number
          rating_id?: number
          score?: number | null
          source_id?: number
          topic?: string | null
          updated_at?: string | null
          user_id?: string
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
            foreignKeyName: "Leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
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
      Methods: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["method_name"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["method_name"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["method_name"]
          updated_at?: string
        }
        Relationships: []
      }
      Opportunities: {
        Row: {
          act_budget: number | null
          act_close_date: string | null
          act_revenue: number | null
          close_reason_id: number | null
          company_id: number
          confidence: number | null
          contact_id: number
          created_at: string | null
          currency_id: number | null
          current_situation: string | null
          customer_need: string | null
          description: string | null
          est_budget: number | null
          est_revenue: number | null
          id: number
          lead_id: number
          opportunity_status_id: number
          organization_id: number
          payment_plan_id: number | null
          priority: Database["public"]["Enums"]["priority_statuses"] | null
          proposed_solution: string | null
          rating_id: number
          topic: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          act_budget?: number | null
          act_close_date?: string | null
          act_revenue?: number | null
          close_reason_id?: number | null
          company_id: number
          confidence?: number | null
          contact_id: number
          created_at?: string | null
          currency_id?: number | null
          current_situation?: string | null
          customer_need?: string | null
          description?: string | null
          est_budget?: number | null
          est_revenue?: number | null
          id?: number
          lead_id: number
          opportunity_status_id: number
          organization_id: number
          payment_plan_id?: number | null
          priority?: Database["public"]["Enums"]["priority_statuses"] | null
          proposed_solution?: string | null
          rating_id: number
          topic: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          act_budget?: number | null
          act_close_date?: string | null
          act_revenue?: number | null
          close_reason_id?: number | null
          company_id?: number
          confidence?: number | null
          contact_id?: number
          created_at?: string | null
          currency_id?: number | null
          current_situation?: string | null
          customer_need?: string | null
          description?: string | null
          est_budget?: number | null
          est_revenue?: number | null
          id?: number
          lead_id?: number
          opportunity_status_id?: number
          organization_id?: number
          payment_plan_id?: number | null
          priority?: Database["public"]["Enums"]["priority_statuses"] | null
          proposed_solution?: string | null
          rating_id?: number
          topic?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Opportunities_close_reason_id_fkey"
            columns: ["close_reason_id"]
            isOneToOne: false
            referencedRelation: "Close_Reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "Contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "Currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "Leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_oppotunity_status_id_fkey"
            columns: ["opportunity_status_id"]
            isOneToOne: false
            referencedRelation: "Opportunity_Statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "Payment_Plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "Ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Opportunity_Statuses: {
        Row: {
          created_at: string
          id: number
          name: string
          organization_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          organization_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          organization_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Opportunity_Statuses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
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
      Payment_Plans: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["payment_plans"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["payment_plans"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["payment_plans"]
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
            referencedRelation: "B2B_Companies"
            referencedColumns: ["id"]
          },
        ]
      }
      Priority: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["priority_statuses"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["priority_statuses"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["priority_statuses"]
          updated_at?: string
        }
        Relationships: []
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
          name: Database["public"]["Enums"]["rating_name"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["rating_name"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["rating_name"]
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
          name: Database["public"]["Enums"]["source_name"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["source_name"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["source_name"]
          updated_at?: string
        }
        Relationships: []
      }
      Tasks: {
        Row: {
          created_at: string
          date: string
          description: string
          id: number
          is_completed: boolean
          lead_id: number | null
          opportunity_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: number
          is_completed?: boolean
          lead_id?: number | null
          opportunity_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: number
          is_completed?: boolean
          lead_id?: number | null
          opportunity_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "Leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "Opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
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
      close_reasons:
        | "pricing"
        | "competition"
        | "long sales cycle"
        | "communication"
        | "decision making"
        | "others"
      company_statuses: "new" | "qualified" | "disqualified"
      contact_statuses: "new" | "qualified" | "disqualified"
      currencies: "idr" | "usd"
      disqualify_reasons:
        | "lost"
        | "cannot contact"
        | "no longer interested"
        | "canceled"
      lead_statuses: "new" | "contacted" | "qualified" | "disqualified"
      method_name: "email" | "note" | "call"
      opportunity_statuses:
        | "qualified"
        | "proposal send"
        | "contract send"
        | "won"
        | "lost"
      payment_plans: "one-time" | "weekly" | "monthly" | "yearly"
      priority_statuses: "urgent" | "high" | "medium" | "low"
      rating_name: "cool" | "warm" | "hot"
      role_names: "owner" | "admin" | "manager" | "sales"
      source_name: "google" | "linkedin" | "manual"
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
