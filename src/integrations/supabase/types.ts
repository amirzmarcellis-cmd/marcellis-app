export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          call_status: string
          call_timestamp: string
          call_type: string
          candidate_id: string
          created_at: string
          duration: number | null
          id: string
          job_id: string | null
          recruiter_id: string | null
          recruiter_notes: string | null
          updated_at: string
        }
        Insert: {
          call_status?: string
          call_timestamp?: string
          call_type?: string
          candidate_id: string
          created_at?: string
          duration?: number | null
          id?: string
          job_id?: string | null
          recruiter_id?: string | null
          recruiter_notes?: string | null
          updated_at?: string
        }
        Update: {
          call_status?: string
          call_timestamp?: string
          call_type?: string
          candidate_id?: string
          created_at?: string
          duration?: number | null
          id?: string
          job_id?: string | null
          recruiter_id?: string | null
          recruiter_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          tagged_users: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          tagged_users?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tagged_users?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      CVs: {
        Row: {
          applied_for: string[] | null
          candidate_id: string
          CandidateStatus: string | null
          Certifications: string | null
          current_company: string | null
          CV_Link: string | null
          cv_summary: string | null
          cv_text: string | null
          done_questions: string | null
          Education: string | null
          Email: string | null
          Experience: string | null
          first_name: string | null
          Language: string | null
          last_name: string | null
          Linkedin: string | null
          Location: string | null
          other_notes: string | null
          phone_number: string | null
          Skills: string | null
          Timestamp: string | null
          Title: string | null
        }
        Insert: {
          applied_for?: string[] | null
          candidate_id: string
          CandidateStatus?: string | null
          Certifications?: string | null
          current_company?: string | null
          CV_Link?: string | null
          cv_summary?: string | null
          cv_text?: string | null
          done_questions?: string | null
          Education?: string | null
          Email?: string | null
          Experience?: string | null
          first_name?: string | null
          Language?: string | null
          last_name?: string | null
          Linkedin?: string | null
          Location?: string | null
          other_notes?: string | null
          phone_number?: string | null
          Skills?: string | null
          Timestamp?: string | null
          Title?: string | null
        }
        Update: {
          applied_for?: string[] | null
          candidate_id?: string
          CandidateStatus?: string | null
          Certifications?: string | null
          current_company?: string | null
          CV_Link?: string | null
          cv_summary?: string | null
          cv_text?: string | null
          done_questions?: string | null
          Education?: string | null
          Email?: string | null
          Experience?: string | null
          first_name?: string | null
          Language?: string | null
          last_name?: string | null
          Linkedin?: string | null
          Location?: string | null
          other_notes?: string | null
          phone_number?: string | null
          Skills?: string | null
          Timestamp?: string | null
          Title?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      Jobs: {
        Row: {
          assignment: string | null
          client_description: string | null
          contract_length: string | null
          Currency: string | null
          jd_summary: string | null
          job_description: string | null
          job_id: string
          job_location: string | null
          job_salary_range: string | null
          job_title: string | null
          longlist: number
          musttohave: string | null
          nationality_to_exclude: string | null
          nationality_to_include: string | null
          nicetohave: string | null
          notice_period: string | null
          Processed: string | null
          things_to_look_for: string | null
          Timestamp: string | null
          Type: string | null
        }
        Insert: {
          assignment?: string | null
          client_description?: string | null
          contract_length?: string | null
          Currency?: string | null
          jd_summary?: string | null
          job_description?: string | null
          job_id: string
          job_location?: string | null
          job_salary_range?: string | null
          job_title?: string | null
          longlist?: number
          musttohave?: string | null
          nationality_to_exclude?: string | null
          nationality_to_include?: string | null
          nicetohave?: string | null
          notice_period?: string | null
          Processed?: string | null
          things_to_look_for?: string | null
          Timestamp?: string | null
          Type?: string | null
        }
        Update: {
          assignment?: string | null
          client_description?: string | null
          contract_length?: string | null
          Currency?: string | null
          jd_summary?: string | null
          job_description?: string | null
          job_id?: string
          job_location?: string | null
          job_salary_range?: string | null
          job_title?: string | null
          longlist?: number
          musttohave?: string | null
          nationality_to_exclude?: string | null
          nationality_to_include?: string | null
          nicetohave?: string | null
          notice_period?: string | null
          Processed?: string | null
          things_to_look_for?: string | null
          Timestamp?: string | null
          Type?: string | null
        }
        Relationships: []
      }
      Jobs_CVs: {
        Row: {
          agency_experience: string | null
          callcount: number
          callid: number
          candidate_email: string | null
          Candidate_ID: string | null
          candidate_name: string | null
          candidate_phone_number: string | null
          cons: string | null
          contacted: string | null
          current_salary: string | null
          cv_link: string | null
          duration: string | null
          group_id: number | null
          job_id: string | null
          lastcalltime: string | null
          longlisted_at: string | null
          notes: string | null
          notice_period: string | null
          pros: string | null
          recording: string | null
          relatable_cv: string | null
          salary_expectations: string | null
          score_and_reason: string | null
          shortlisted_at: string | null
          success_score: string | null
          summary: string | null
          transcript: string | null
          two_questions_of_interview: string | null
        }
        Insert: {
          agency_experience?: string | null
          callcount?: number
          callid?: number
          candidate_email?: string | null
          Candidate_ID?: string | null
          candidate_name?: string | null
          candidate_phone_number?: string | null
          cons?: string | null
          contacted?: string | null
          current_salary?: string | null
          cv_link?: string | null
          duration?: string | null
          group_id?: number | null
          job_id?: string | null
          lastcalltime?: string | null
          longlisted_at?: string | null
          notes?: string | null
          notice_period?: string | null
          pros?: string | null
          recording?: string | null
          relatable_cv?: string | null
          salary_expectations?: string | null
          score_and_reason?: string | null
          shortlisted_at?: string | null
          success_score?: string | null
          summary?: string | null
          transcript?: string | null
          two_questions_of_interview?: string | null
        }
        Update: {
          agency_experience?: string | null
          callcount?: number
          callid?: number
          candidate_email?: string | null
          Candidate_ID?: string | null
          candidate_name?: string | null
          candidate_phone_number?: string | null
          cons?: string | null
          contacted?: string | null
          current_salary?: string | null
          cv_link?: string | null
          duration?: string | null
          group_id?: number | null
          job_id?: string | null
          lastcalltime?: string | null
          longlisted_at?: string | null
          notes?: string | null
          notice_period?: string | null
          pros?: string | null
          recording?: string | null
          relatable_cv?: string | null
          salary_expectations?: string | null
          score_and_reason?: string | null
          shortlisted_at?: string | null
          success_score?: string | null
          summary?: string | null
          transcript?: string | null
          two_questions_of_interview?: string | null
        }
        Relationships: []
      }
      status_candidate_lookup: {
        Row: {
          active: boolean
          created_at: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          label: string
          sort_order: number
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      status_contacted_lookup: {
        Row: {
          active: boolean
          created_at: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          label: string
          sort_order: number
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          call_log_id: string | null
          candidate_id: string | null
          change_type: string
          comment_id: string | null
          created_at: string
          description: string | null
          entity_type: string
          from_status: string | null
          id: string
          job_id: string | null
          metadata: Json
          to_status: string | null
          user_id: string | null
        }
        Insert: {
          call_log_id?: string | null
          candidate_id?: string | null
          change_type: string
          comment_id?: string | null
          created_at?: string
          description?: string | null
          entity_type: string
          from_status?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json
          to_status?: string | null
          user_id?: string | null
        }
        Update: {
          call_log_id?: string | null
          candidate_id?: string | null
          change_type?: string
          comment_id?: string | null
          created_at?: string
          description?: string | null
          entity_type?: string
          from_status?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json
          to_status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_calls_daily: {
        Row: {
          avg_duration_seconds: number | null
          connected_calls: number | null
          day: string | null
          job_id: string | null
          no_answer_calls: number | null
          recruiter_id: string | null
          total_calls: number | null
        }
        Relationships: []
      }
      mv_candidate_status_counts: {
        Row: {
          count: number | null
          status: string | null
        }
        Relationships: []
      }
      mv_contacted_status_counts_by_job: {
        Row: {
          contacted_status: string | null
          count: number | null
          job_id: string | null
        }
        Relationships: []
      }
      v_time_to_shortlist: {
        Row: {
          avg_hours_to_shortlist: number | null
          job_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      refresh_reporting_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "recruiter"
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
      app_role: ["admin", "manager", "recruiter"],
    },
  },
} as const
