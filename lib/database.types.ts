export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      metadata: {
        Row: {
          key: string
          value: string | null
          updated_at: string | null
        }
        Insert: {
          key: string
          value?: string | null
          updated_at?: string | null
        }
        Update: {
          key?: string
          value?: string | null
          updated_at?: string | null
        }
      }
      manufacturers: {
        Row: {
          manufacturer_id: number
          name: string
          website: string | null
          founded: string | null
          headquarters: string | null
          ceo: string | null
          revenue_operating_income_net_income: string | null
          total_assets_total_equity: string | null
          num_employees: string | null
          history: string | null
          licensed_vaccines: string | null
          vaccine_candidates: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          manufacturer_id?: number
          name: string
          website?: string | null
          founded?: string | null
          headquarters?: string | null
          ceo?: string | null
          revenue_operating_income_net_income?: string | null
          total_assets_total_equity?: string | null
          num_employees?: number | null
          history?: string | null
          licensed_vaccines?: string | null
          vaccine_candidates?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          manufacturer_id?: number
          name?: string
          website?: string | null
          founded?: string | null
          headquarters?: string | null
          ceo?: string | null
          revenue_operating_income_net_income?: string | null
          total_assets_total_equity?: string | null
          num_employees?: number | null
          history?: string | null
          licensed_vaccines?: string | null
          vaccine_candidates?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      licensed_vaccines: {
        Row: {
          licensed_vaccine_id: number
          pathogen_name: string
          vaccine_brand_name: string
          single_or_combination: string | null
          authority_name: string | null
          vaccine_link: string | null
          authority_link: string | null
          manufacturer: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          licensed_vaccine_id?: number
          pathogen_name: string
          vaccine_brand_name: string
          single_or_combination?: string | null
          authority_name?: string | null
          vaccine_link?: string | null
          authority_link?: string | null
          manufacturer?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          licensed_vaccine_id?: number
          pathogen_name?: string
          vaccine_brand_name?: string
          single_or_combination?: string | null
          authority_name?: string | null
          vaccine_link?: string | null
          authority_link?: string | null
          manufacturer?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vaccine_candidates: {
        Row: {
          candidate_id: number
          pathogen_name: string
          vaccine_name: string
          vaccine_link: string | null
          phase_i: string | null
          phase_ii: string | null
          phase_iii: string | null
          phase_iv: string | null
          manufacturer: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id?: number
          pathogen_name: string
          vaccine_name: string
          vaccine_link?: string | null
          phase_I?: boolean | null
          phase_II?: boolean | null
          phase_III?: boolean | null
          phase_IV?: boolean | null
          manufacturer?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: number
          pathogen_name?: string
          vaccine_name?: string
          vaccine_link?: string | null
          phase_I?: boolean | null
          phase_II?: boolean | null
          phase_III?: boolean | null
          phase_IV?: boolean | null
          manufacturer?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      licensing_authorities: {
        Row: {
          authority_id: number
          country: string | null
          authority_name: string
          info: string | null
          vaccine_brand_name: string | null
          single_or_combination: string | null
          pathogen_name: string | null
          manufacturer: string | null
          website: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          authority_id?: number
          country?: string | null
          authority_name: string
          info?: string | null
          vaccine_brand_name?: string | null
          single_or_combination?: string | null
          pathogen_name?: string | null
          manufacturer?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          authority_id?: number
          country?: string | null
          authority_name?: string
          info?: string | null
          vaccine_brand_name?: string | null
          single_or_combination?: string | null
          pathogen_name?: string | null
          manufacturer?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      nitags: {
        Row: {
          nitag_id: number
          country: string
          available: boolean | null
          website: string | null
          url: string | null
          nitag_name: string | null
          established: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          nitag_id?: number
          country: string
          available?: boolean | null
          website?: string | null
          url?: string | null
          nitag_name?: string | null
          established?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          nitag_id?: number
          country?: string
          available?: boolean | null
          website?: string | null
          url?: string | null
          nitag_name?: string | null
          established?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
