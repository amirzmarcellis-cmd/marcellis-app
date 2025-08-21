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
      activity_logs: {
        Row: {
          action_type: string
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_status: string
          call_timestamp: string
          call_type: string
          candidate_id: string
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          job_id?: string | null
          recruiter_id?: string | null
          recruiter_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tagged_users?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          plan_type: string | null
          settings: Json | null
          subdomain: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          plan_type?: string | null
          settings?: Json | null
          subdomain: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan_type?: string | null
          settings?: Json | null
          subdomain?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_subscriptions: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          invited_at: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      CVs: {
        Row: {
          applied_for: string[] | null
          candidate_id: string
          CandidateStatus: string | null
          Certifications: string | null
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "CVs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_jobs_cvs_audit: {
        Row: {
          deleted_at: string | null
          original_record: Json | null
        }
        Insert: {
          deleted_at?: string | null
          original_record?: Json | null
        }
        Update: {
          deleted_at?: string | null
          original_record?: Json | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "file_uploads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      interview: {
        Row: {
          appoint1: string | null
          appoint2: string | null
          appoint3: string | null
          callid: number | null
          candidate_id: string | null
          chosen_time: string | null
          company_id: string | null
          created_at: string | null
          intid: string
          intlink: string | null
          intstatus: string | null
          inttype: string | null
          job_id: string | null
          updated_at: string | null
        }
        Insert: {
          appoint1?: string | null
          appoint2?: string | null
          appoint3?: string | null
          callid?: number | null
          candidate_id?: string | null
          chosen_time?: string | null
          company_id?: string | null
          created_at?: string | null
          intid?: string
          intlink?: string | null
          intstatus?: string | null
          inttype?: string | null
          job_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appoint1?: string | null
          appoint2?: string | null
          appoint3?: string | null
          callid?: number | null
          candidate_id?: string | null
          chosen_time?: string | null
          company_id?: string | null
          created_at?: string | null
          intid?: string
          intlink?: string | null
          intstatus?: string | null
          inttype?: string | null
          job_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      Jobs: {
        Row: {
          assignment: string | null
          client_description: string | null
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "Jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
          company_id: string | null
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
          notes_updated_at: string | null
          notes_updated_by: string | null
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
          company_id?: string | null
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
          notes_updated_at?: string | null
          notes_updated_by?: string | null
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
          company_id?: string | null
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
          notes_updated_at?: string | null
          notes_updated_by?: string | null
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
        Relationships: [
          {
            foreignKeyName: "Jobs_CVs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "status_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_candidates: {
        Row: {
          callid: number | null
          candidate_email: string | null
          candidate_id: string
          candidate_phone_number: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          job_id: string
          status: string
          taskid: number
          tasklink: string | null
          updated_at: string
        }
        Insert: {
          callid?: number | null
          candidate_email?: string | null
          candidate_id: string
          candidate_phone_number?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          job_id: string
          status?: string
          taskid?: number
          tasklink?: string | null
          updated_at?: string
        }
        Update: {
          callid?: number | null
          candidate_email?: string | null
          candidate_id?: string
          candidate_phone_number?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          job_id?: string
          status?: string
          taskid?: number
          tasklink?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
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
      assign_platform_admin_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      assign_platform_admin_by_user_id: {
        Args: { target_user_id: string }
        Returns: string
      }
      generate_interview_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_company: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_companies: {
        Args: { _user_id: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _company_id?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_reporting_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "platform_admin" | "company_admin" | "manager" | "recruiter"
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
      app_role: ["platform_admin", "company_admin", "manager", "recruiter"],
    },
  },
} as const
