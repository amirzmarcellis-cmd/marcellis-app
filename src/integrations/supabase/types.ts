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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      calendar_preferences: {
        Row: {
          created_at: string
          default_view: string
          id: string
          updated_at: string
          user_id: string
          work_days: string
          work_end: string
          work_start: string
        }
        Insert: {
          created_at?: string
          default_view?: string
          id?: string
          updated_at?: string
          user_id: string
          work_days?: string
          work_end?: string
          work_start?: string
        }
        Update: {
          created_at?: string
          default_view?: string
          id?: string
          updated_at?: string
          user_id?: string
          work_days?: string
          work_end?: string
          work_start?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          cv_text: string | null
          Firstname: string | null
          Lastname: string | null
          user_id: number
        }
        Insert: {
          cv_text?: string | null
          Firstname?: string | null
          Lastname?: string | null
          user_id?: number
        }
        Update: {
          cv_text?: string | null
          Firstname?: string | null
          Lastname?: string | null
          user_id?: number
        }
        Relationships: []
      }
      CVs: {
        Row: {
          cv_link: string | null
          cv_text: string | null
          done_questions: string | null
          email: string | null
          Firstname: string | null
          formatted_cv: string | null
          job_id: string | null
          Lastname: string | null
          name: string | null
          notes: string | null
          phone_number: string | null
          updated_time: string | null
          user_id: string
        }
        Insert: {
          cv_link?: string | null
          cv_text?: string | null
          done_questions?: string | null
          email?: string | null
          Firstname?: string | null
          formatted_cv?: string | null
          job_id?: string | null
          Lastname?: string | null
          name?: string | null
          notes?: string | null
          phone_number?: string | null
          updated_time?: string | null
          user_id: string
        }
        Update: {
          cv_link?: string | null
          cv_text?: string | null
          done_questions?: string | null
          email?: string | null
          Firstname?: string | null
          formatted_cv?: string | null
          job_id?: string | null
          Lastname?: string | null
          name?: string | null
          notes?: string | null
          phone_number?: string | null
          updated_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      CVs_duplicate: {
        Row: {
          cv_text: string | null
          email: string | null
          Firstname: string | null
          Lastname: string | null
          name: string | null
          phone_number: string | null
          user_id: string
        }
        Insert: {
          cv_text?: string | null
          email?: string | null
          Firstname?: string | null
          Lastname?: string | null
          name?: string | null
          phone_number?: string | null
          user_id: string
        }
        Update: {
          cv_text?: string | null
          email?: string | null
          Firstname?: string | null
          Lastname?: string | null
          name?: string | null
          phone_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Jobs: {
        Row: {
          assignment: string | null
          auto_dial_enabled_at: string | null
          automatic_dial: boolean | null
          client_description: string | null
          client_name: string | null
          contract_length: string | null
          Currency: string | null
          group_id: string | null
          itris_job_id: string | null
          jd_link: string | null
          jd_summary: string | null
          job_description: string | null
          job_id: string
          job_location: string | null
          job_salary_range: number | null
          job_title: string | null
          longlist: number | null
          musttohave: string | null
          nationality_to_exclude: string | null
          nationality_to_include: string | null
          nicetohave: string | null
          notice_period: string | null
          Processed: string | null
          recruiter_id: string | null
          status: string | null
          things_to_look_for: string | null
          Timestamp: string | null
          Type: string | null
        }
        Insert: {
          assignment?: string | null
          auto_dial_enabled_at?: string | null
          automatic_dial?: boolean | null
          client_description?: string | null
          client_name?: string | null
          contract_length?: string | null
          Currency?: string | null
          group_id?: string | null
          itris_job_id?: string | null
          jd_link?: string | null
          jd_summary?: string | null
          job_description?: string | null
          job_id: string
          job_location?: string | null
          job_salary_range?: number | null
          job_title?: string | null
          longlist?: number | null
          musttohave?: string | null
          nationality_to_exclude?: string | null
          nationality_to_include?: string | null
          nicetohave?: string | null
          notice_period?: string | null
          Processed?: string | null
          recruiter_id?: string | null
          status?: string | null
          things_to_look_for?: string | null
          Timestamp?: string | null
          Type?: string | null
        }
        Update: {
          assignment?: string | null
          auto_dial_enabled_at?: string | null
          automatic_dial?: boolean | null
          client_description?: string | null
          client_name?: string | null
          contract_length?: string | null
          Currency?: string | null
          group_id?: string | null
          itris_job_id?: string | null
          jd_link?: string | null
          jd_summary?: string | null
          job_description?: string | null
          job_id?: string
          job_location?: string | null
          job_salary_range?: number | null
          job_title?: string | null
          longlist?: number | null
          musttohave?: string | null
          nationality_to_exclude?: string | null
          nationality_to_include?: string | null
          nicetohave?: string | null
          notice_period?: string | null
          Processed?: string | null
          recruiter_id?: string | null
          status?: string | null
          things_to_look_for?: string | null
          Timestamp?: string | null
          Type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Jobs_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      Jobs_CVs: {
        Row: {
          after_call_cons: string | null
          after_call_pros: string | null
          after_call_reason: string | null
          after_call_score: number | null
          call_summary: string | null
          callcount: number | null
          candidate_email: string | null
          candidate_name: string | null
          candidate_phone_number: string | null
          contacted: string | null
          current_salary: number | null
          cv_score: number | null
          cv_score_reason: string | null
          duration: string | null
          itris_job_id: string | null
          job_id: string
          lastcalltime: string | null
          linkedin_score: number | null
          linkedin_score_reason: string | null
          longlisted_at: string | null
          notes: string | null
          notes_updated_at: string | null
          notes_updated_by: string | null
          notice_period: string | null
          qualification_status: string | null
          qualifications: string | null
          Reason_to_Hire: string | null
          Reason_to_reject: string | null
          recordid: number
          recording: string | null
          recruiter_id: string | null
          salary_expectations: string | null
          shortlisted_at: string | null
          source: string | null
          submitted_at: string | null
          transcript: string | null
          two_questions_of_interview: string | null
          user_id: string | null
        }
        Insert: {
          after_call_cons?: string | null
          after_call_pros?: string | null
          after_call_reason?: string | null
          after_call_score?: number | null
          call_summary?: string | null
          callcount?: number | null
          candidate_email?: string | null
          candidate_name?: string | null
          candidate_phone_number?: string | null
          contacted?: string | null
          current_salary?: number | null
          cv_score?: number | null
          cv_score_reason?: string | null
          duration?: string | null
          itris_job_id?: string | null
          job_id: string
          lastcalltime?: string | null
          linkedin_score?: number | null
          linkedin_score_reason?: string | null
          longlisted_at?: string | null
          notes?: string | null
          notes_updated_at?: string | null
          notes_updated_by?: string | null
          notice_period?: string | null
          qualification_status?: string | null
          qualifications?: string | null
          Reason_to_Hire?: string | null
          Reason_to_reject?: string | null
          recordid?: number
          recording?: string | null
          recruiter_id?: string | null
          salary_expectations?: string | null
          shortlisted_at?: string | null
          source?: string | null
          submitted_at?: string | null
          transcript?: string | null
          two_questions_of_interview?: string | null
          user_id?: string | null
        }
        Update: {
          after_call_cons?: string | null
          after_call_pros?: string | null
          after_call_reason?: string | null
          after_call_score?: number | null
          call_summary?: string | null
          callcount?: number | null
          candidate_email?: string | null
          candidate_name?: string | null
          candidate_phone_number?: string | null
          contacted?: string | null
          current_salary?: number | null
          cv_score?: number | null
          cv_score_reason?: string | null
          duration?: string | null
          itris_job_id?: string | null
          job_id?: string
          lastcalltime?: string | null
          linkedin_score?: number | null
          linkedin_score_reason?: string | null
          longlisted_at?: string | null
          notes?: string | null
          notes_updated_at?: string | null
          notes_updated_by?: string | null
          notice_period?: string | null
          qualification_status?: string | null
          qualifications?: string | null
          Reason_to_Hire?: string | null
          Reason_to_reject?: string | null
          recordid?: number
          recording?: string | null
          recruiter_id?: string | null
          salary_expectations?: string | null
          shortlisted_at?: string | null
          source?: string | null
          submitted_at?: string | null
          transcript?: string | null
          two_questions_of_interview?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      linkedin_boolean_search: {
        Row: {
          chat_id: string | null
          id: number
          job_id: string | null
          linkedin_id: string | null
          recruiter_id: string | null
          status: string | null
          thread_id: string | null
          unipile_user_id: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          id?: number
          job_id?: string | null
          linkedin_id?: string | null
          recruiter_id?: string | null
          status?: string | null
          thread_id?: string | null
          unipile_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          id?: number
          job_id?: string | null
          linkedin_id?: string | null
          recruiter_id?: string | null
          status?: string | null
          thread_id?: string | null
          unipile_user_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_memberships_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          linkedin_id: string | null
          name: string | null
          slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean
          linkedin_id?: string | null
          name?: string | null
          slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          linkedin_id?: string | null
          name?: string | null
          slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string
          created_at: string
          created_by_id: string
          deadline: string
          description: string | null
          due_date: string | null
          estimated_minutes: number | null
          id: string
          is_subtask: boolean
          order_index: number
          parent_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          created_at?: string
          created_by_id: string
          deadline: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          is_subtask?: boolean
          order_index?: number
          parent_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          created_at?: string
          created_by_id?: string
          deadline?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          is_subtask?: boolean
          order_index?: number
          parent_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      timers: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          started_at: string
          stopped_at: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          started_at?: string
          stopped_at?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          started_at?: string
          stopped_at?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      disable_expired_auto_dial: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_org_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
      get_user_team_role: {
        Args: { team_name: string; user_uuid: string }
        Returns: string
      }
      get_user_teams: {
        Args: { user_uuid: string }
        Returns: {
          role: string
          team_name: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_org_role: {
        Args: {
          _role: Database["public"]["Enums"]["org_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_team_leader: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      org_role: "ADMIN" | "MANAGEMENT" | "EMPLOYEE"
      task_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
      user_role: "TEAM_LEADER" | "EMPLOYEE"
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
    Enums: {
      org_role: ["ADMIN", "MANAGEMENT", "EMPLOYEE"],
      task_status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      user_role: ["TEAM_LEADER", "EMPLOYEE"],
    },
  },
} as const
