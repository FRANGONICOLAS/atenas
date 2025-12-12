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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      beneficiary: {
        Row: {
          beneficiary_id: string
          birth_date: string | null
          category: string | null
          first_name: string
          headquarters_id: string
          last_name: string
          phone: string | null
          registry_date: string | null
        }
        Insert: {
          beneficiary_id?: string
          birth_date?: string | null
          category?: string | null
          first_name: string
          headquarters_id: string
          last_name: string
          phone?: string | null
          registry_date?: string | null
        }
        Update: {
          beneficiary_id?: string
          birth_date?: string | null
          category?: string | null
          first_name?: string
          headquarters_id?: string
          last_name?: string
          phone?: string | null
          registry_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_headquarters_id_fkey"
            columns: ["headquarters_id"]
            isOneToOne: false
            referencedRelation: "headquarters"
            referencedColumns: ["headquarters_id"]
          },
        ]
      }
      beneficiary_evaluation: {
        Row: {
          beneficiary_id: string
          evaluation_id: string
          generated_at: string | null
          observation: string | null
          recommendation: string | null
          total_assistance: number | null
        }
        Insert: {
          beneficiary_id: string
          evaluation_id?: string
          generated_at?: string | null
          observation?: string | null
          recommendation?: string | null
          total_assistance?: number | null
        }
        Update: {
          beneficiary_id?: string
          evaluation_id?: string
          generated_at?: string | null
          observation?: string | null
          recommendation?: string | null
          total_assistance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaryEvaluation_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary"
            referencedColumns: ["beneficiary_id"]
          },
        ]
      }
      donation: {
        Row: {
          amount: number
          approve_code: string | null
          created_at: string | null
          currency: string
          date: string
          donation_id: string
          pay_method: string | null
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          approve_code?: string | null
          created_at?: string | null
          currency?: string
          date?: string
          donation_id?: string
          pay_method?: string | null
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          approve_code?: string | null
          created_at?: string | null
          currency?: string
          date?: string
          donation_id?: string
          pay_method?: string | null
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "donation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_report: {
        Row: {
          donation_report_id: string
          generated_at: string | null
          project_id: string
        }
        Insert: {
          donation_report_id?: string
          generated_at?: string | null
          project_id: string
        }
        Update: {
          donation_report_id?: string
          generated_at?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donationReport_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      headquarters: {
        Row: {
          address: string | null
          created_at: string | null
          headquarters_id: string
          location_map: string | null
          name: string
          status: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          headquarters_id?: string
          location_map?: string | null
          name: string
          status?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          headquarters_id?: string
          location_map?: string | null
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "headquarters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      headquarters_project: {
        Row: {
          assigned_at: string | null
          headquarters_id: string
          project_id: string
        }
        Insert: {
          assigned_at?: string | null
          headquarters_id: string
          project_id: string
        }
        Update: {
          assigned_at?: string | null
          headquarters_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "headquarters_project_headquarters_id_fkey"
            columns: ["headquarters_id"]
            isOneToOne: false
            referencedRelation: "headquarters"
            referencedColumns: ["headquarters_id"]
          },
          {
            foreignKeyName: "headquarters_project_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
        ]
      }
      multimedia: {
        Row: {
          description: string | null
          multimedia_id: string
          type: string | null
          upload_date: string | null
          url: string
          user_id: string
        }
        Insert: {
          description?: string | null
          multimedia_id?: string
          type?: string | null
          upload_date?: string | null
          url: string
          user_id: string
        }
        Update: {
          description?: string | null
          multimedia_id?: string
          type?: string | null
          upload_date?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multimedia_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          category: string | null
          description: string | null
          end_date: string | null
          finance_goal: number | null
          name: string
          project_id: string
          start_date: string | null
          status: string
          type: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          end_date?: string | null
          finance_goal?: number | null
          name: string
          project_id?: string
          start_date?: string | null
          status?: string
          type?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          end_date?: string | null
          finance_goal?: number | null
          name?: string
          project_id?: string
          start_date?: string | null
          status?: string
          type?: string | null
        }
        Relationships: []
      }
      role: {
        Row: {
          role_id: string
          role_name: string
        }
        Insert: {
          role_id: string
          role_name: string
        }
        Update: {
          role_id?: string
          role_name?: string
        }
        Relationships: []
      }
      testimonial: {
        Row: {
          approve: boolean | null
          beneficiary_id: string
          content: string
          date: string | null
          status: string
          testimonial_id: string
          title: string
          user_id: string
        }
        Insert: {
          approve?: boolean | null
          beneficiary_id: string
          content: string
          date?: string | null
          status?: string
          testimonial_id?: string
          title: string
          user_id: string
        }
        Update: {
          approve?: boolean | null
          beneficiary_id?: string
          content?: string
          date?: string | null
          status?: string
          testimonial_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "testimonial_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          birthdate: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_images_id: string | null
          username: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_images_id?: string | null
          username: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_images_id?: string | null
          username?: string
        }
        Relationships: []
      }
      user_role: {
        Row: {
          assigned_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_role_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_new_user: {
        Args: {
          user_birthdate: string
          user_email: string
          user_first_name: string
          user_id: string
          user_last_name: string
          user_phone: string
          user_role?: string
          user_username: string
        }
        Returns: {
          birthdate: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_images_id: string | null
          username: string
        }
        SetofOptions: {
          from: "*"
          to: "user"
          isOneToOne: true
          isSetofReturn: false
        }
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

// ============================================
// Legacy application types - maintained for compatibility
// ============================================
export type UserRole = "donator" | "director" | "admin" | "director_sede" | "entrenador";

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birthdate: string | null;
  username: string;
  phone: string | null;
  email: string;
  profile_images_id?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: string[]; // Array of role_ids from user_role table
}

export interface CreateUserData {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  username: string;
  phone?: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  username?: string;
  phone?: string;
  profile_images_id?: string;
}

// Tipos para jugadores (no autenticados)
export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  category: string;
  position: string;
  jersey_number?: number;
  photo_url?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  sede_id?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlayerData {
  first_name: string;
  last_name: string;
  birthdate: string;
  category: string;
  position: string;
  jersey_number?: number;
  photo_url?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  sede_id?: string;
  active?: boolean;
}

// Tipos para entrenadores (no autenticados)
export interface Coach {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  specialization: string;
  experience_years?: number;
  phone: string;
  email?: string;
  photo_url?: string;
  sede_id?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCoachData {
  first_name: string;
  last_name: string;
  birthdate: string;
  specialization: string;
  experience_years?: number;
  phone: string;
  email?: string;
  photo_url?: string;
  sede_id?: string;
  active?: boolean;
}

// Tipo para errores de Supabase
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Tipo genérico para respuestas de Supabase
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}
