/**
 * Main Database type definition
 * This combines all table types into the Database structure expected by Supabase
 */

import type { Json } from './base.db'
import type { BeneficiaryRow, BeneficiaryInsert, BeneficiaryUpdate } from './beneficiary.db'
import type { BoldTransactionsRow, BoldTransactionsInsert, BoldTransactionsUpdate } from './bold-transactions.db'
import type { DonationRow, DonationInsert, DonationUpdate } from './donation.db'
import type { DonationReportRow, DonationReportInsert, DonationReportUpdate } from './donation-report.db'
import type { GalleryItemsRow, GalleryItemsInsert, GalleryItemsUpdate } from './gallery-items.db'
import type { HeadquartersRow, HeadquartersInsert, HeadquartersUpdate } from './headquarters.db'
import type { HeadquartersProjectRow, HeadquartersProjectInsert, HeadquartersProjectUpdate } from './headquarters-project.db'
import type { ProjectRow, ProjectInsert, ProjectUpdate } from './project.db'
import type { RoleRow, RoleInsert, RoleUpdate } from './role.db'
import type { SiteContentsRow, SiteContentsInsert, SiteContentsUpdate } from './site-contents.db'
import type { TestimonialRow, TestimonialInsert, TestimonialUpdate } from './testimonial.db'
import type { UserRow, UserInsert, UserUpdate } from './user.db'
import type { UserRoleRow, UserRoleInsert, UserRoleUpdate } from './user-role.db'

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      beneficiary: {
        Row: BeneficiaryRow
        Insert: BeneficiaryInsert
        Update: BeneficiaryUpdate
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
      bold_transactions: {
        Row: BoldTransactionsRow
        Insert: BoldTransactionsInsert
        Update: BoldTransactionsUpdate
        Relationships: [
          {
            foreignKeyName: "bold_transactions_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donation"
            referencedColumns: ["donation_id"]
          },
          {
            foreignKeyName: "bold_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "bold_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      donation: {
        Row: DonationRow
        Insert: DonationInsert
        Update: DonationUpdate
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
        Row: DonationReportRow
        Insert: DonationReportInsert
        Update: DonationReportUpdate
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
      gallery_items: {
        Row: GalleryItemsRow
        Insert: GalleryItemsInsert
        Update: GalleryItemsUpdate
        Relationships: [
          {
            foreignKeyName: "gallery_items_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      headquarters: {
        Row: HeadquartersRow
        Insert: HeadquartersInsert
        Update: HeadquartersUpdate
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
        Row: HeadquartersProjectRow
        Insert: HeadquartersProjectInsert
        Update: HeadquartersProjectUpdate
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
      project: {
        Row: ProjectRow
        Insert: ProjectInsert
        Update: ProjectUpdate
        Relationships: []
      }
      role: {
        Row: RoleRow
        Insert: RoleInsert
        Update: RoleUpdate
        Relationships: []
      }
      site_contents: {
        Row: SiteContentsRow
        Insert: SiteContentsInsert
        Update: SiteContentsUpdate
        Relationships: [
          {
            foreignKeyName: "site_contents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial: {
        Row: TestimonialRow
        Insert: TestimonialInsert
        Update: TestimonialUpdate
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
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
        Relationships: []
      }
      user_role: {
        Row: UserRoleRow
        Insert: UserRoleInsert
        Update: UserRoleUpdate
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
        Returns: UserRow
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
