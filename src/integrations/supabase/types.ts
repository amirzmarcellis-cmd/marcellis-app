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
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          changed_fields: Json | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          performed_at: string
          performed_by: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          changed_fields?: Json | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          performed_at?: string
          performed_by?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          changed_fields?: Json | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          performed_at?: string
          performed_by?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
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
      call_sessions: {
        Row: {
          analysis_json: Json | null
          candidate_name: string | null
          created_at: string | null
          fit_score: number | null
          id: string
          job_id: string | null
          outcome: string | null
          success_evaluation: number | null
          summary: string | null
          transcript: string | null
          vapi_call_id: string | null
        }
        Insert: {
          analysis_json?: Json | null
          candidate_name?: string | null
          created_at?: string | null
          fit_score?: number | null
          id?: string
          job_id?: string | null
          outcome?: string | null
          success_evaluation?: number | null
          summary?: string | null
          transcript?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          analysis_json?: Json | null
          candidate_name?: string | null
          created_at?: string | null
          fit_score?: number | null
          id?: string
          job_id?: string | null
          outcome?: string | null
          success_evaluation?: number | null
          summary?: string | null
          transcript?: string | null
          vapi_call_id?: string | null
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
      clients: {
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
      CVs: {
        Row: {
          applied_for: string[] | null
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
          applied_for?: string[] | null
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
        Update: {
          applied_for?: string[] | null
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
      feedback: {
        Row: {
          call_session_id: string | null
          category: string | null
          created_at: string | null
          detail: string | null
          id: string
          severity: number | null
        }
        Insert: {
          call_session_id?: string | null
          category?: string | null
          created_at?: string | null
          detail?: string | null
          id?: string
          severity?: number | null
        }
        Update: {
          call_session_id?: string | null
          category?: string | null
          created_at?: string | null
          detail?: string | null
          id?: string
          severity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_call_session_id_fkey"
            columns: ["call_session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      groups_duplicate: {
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
          client_id: string | null
          client_name: string | null
          companies_to_exclude: string | null
          contract_length: string | null
          Currency: string | null
          group_id: string | null
          headhunting_companies: string | null
          industry: string | null
          itris_job_id: string | null
          jd_link: string | null
          jd_summary: string | null
          job_description: string | null
          Job_difficulty: number | null
          job_id: string
          job_location: string | null
          job_salary_range: number | null
          job_title: string | null
          linkedin_search_enabled: boolean | null
          longlist: number | null
          musttohave: string | null
          nationality_to_exclude: string | null
          nationality_to_include: string | null
          nicetohave: string | null
          not_prefered_nationality: string | null
          notice_period: string | null
          prefered_nationality: string | null
          Processed: string | null
          recruiter_id: string | null
          status: string | null
          things_to_look_for: string | null
          Timestamp: string | null
          Type: string | null
          vapi_ai_assistant: string | null
        }
        Insert: {
          assignment?: string | null
          auto_dial_enabled_at?: string | null
          automatic_dial?: boolean | null
          client_description?: string | null
          client_id?: string | null
          client_name?: string | null
          companies_to_exclude?: string | null
          contract_length?: string | null
          Currency?: string | null
          group_id?: string | null
          headhunting_companies?: string | null
          industry?: string | null
          itris_job_id?: string | null
          jd_link?: string | null
          jd_summary?: string | null
          job_description?: string | null
          Job_difficulty?: number | null
          job_id: string
          job_location?: string | null
          job_salary_range?: number | null
          job_title?: string | null
          linkedin_search_enabled?: boolean | null
          longlist?: number | null
          musttohave?: string | null
          nationality_to_exclude?: string | null
          nationality_to_include?: string | null
          nicetohave?: string | null
          not_prefered_nationality?: string | null
          notice_period?: string | null
          prefered_nationality?: string | null
          Processed?: string | null
          recruiter_id?: string | null
          status?: string | null
          things_to_look_for?: string | null
          Timestamp?: string | null
          Type?: string | null
          vapi_ai_assistant?: string | null
        }
        Update: {
          assignment?: string | null
          auto_dial_enabled_at?: string | null
          automatic_dial?: boolean | null
          client_description?: string | null
          client_id?: string | null
          client_name?: string | null
          companies_to_exclude?: string | null
          contract_length?: string | null
          Currency?: string | null
          group_id?: string | null
          headhunting_companies?: string | null
          industry?: string | null
          itris_job_id?: string | null
          jd_link?: string | null
          jd_summary?: string | null
          job_description?: string | null
          Job_difficulty?: number | null
          job_id?: string
          job_location?: string | null
          job_salary_range?: number | null
          job_title?: string | null
          linkedin_search_enabled?: boolean | null
          longlist?: number | null
          musttohave?: string | null
          nationality_to_exclude?: string | null
          nationality_to_include?: string | null
          nicetohave?: string | null
          not_prefered_nationality?: string | null
          notice_period?: string | null
          prefered_nationality?: string | null
          Processed?: string | null
          recruiter_id?: string | null
          status?: string | null
          things_to_look_for?: string | null
          Timestamp?: string | null
          Type?: string | null
          vapi_ai_assistant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
          "Browser call - email": boolean | null
          "Browser call - phone": boolean | null
          call_summary: string | null
          callcount: number | null
          candidate_email: string | null
          candidate_fit: string | null
          candidate_fit_reason: string | null
          candidate_name: string | null
          candidate_phone_number: string | null
          "Chat id": string | null
          client_status: string | null
          comm_score: number | null
          comm_summary: string | null
          company_name: string | null
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
          market_intel: string | null
          Message_count: number | null
          nationality: string | null
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
          rejected_at: string | null
          salary_expectations: string | null
          salary_note: string | null
          shortlisted_at: string | null
          source: string | null
          submitted_at: string | null
          transcript: string | null
          two_questions_of_interview: string | null
          user_id: string
        }
        Insert: {
          after_call_cons?: string | null
          after_call_pros?: string | null
          after_call_reason?: string | null
          after_call_score?: number | null
          "Browser call - email"?: boolean | null
          "Browser call - phone"?: boolean | null
          call_summary?: string | null
          callcount?: number | null
          candidate_email?: string | null
          candidate_fit?: string | null
          candidate_fit_reason?: string | null
          candidate_name?: string | null
          candidate_phone_number?: string | null
          "Chat id"?: string | null
          client_status?: string | null
          comm_score?: number | null
          comm_summary?: string | null
          company_name?: string | null
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
          market_intel?: string | null
          Message_count?: number | null
          nationality?: string | null
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
          rejected_at?: string | null
          salary_expectations?: string | null
          salary_note?: string | null
          shortlisted_at?: string | null
          source?: string | null
          submitted_at?: string | null
          transcript?: string | null
          two_questions_of_interview?: string | null
          user_id: string
        }
        Update: {
          after_call_cons?: string | null
          after_call_pros?: string | null
          after_call_reason?: string | null
          after_call_score?: number | null
          "Browser call - email"?: boolean | null
          "Browser call - phone"?: boolean | null
          call_summary?: string | null
          callcount?: number | null
          candidate_email?: string | null
          candidate_fit?: string | null
          candidate_fit_reason?: string | null
          candidate_name?: string | null
          candidate_phone_number?: string | null
          "Chat id"?: string | null
          client_status?: string | null
          comm_score?: number | null
          comm_summary?: string | null
          company_name?: string | null
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
          market_intel?: string | null
          Message_count?: number | null
          nationality?: string | null
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
          rejected_at?: string | null
          salary_expectations?: string | null
          salary_note?: string | null
          shortlisted_at?: string | null
          source?: string | null
          submitted_at?: string | null
          transcript?: string | null
          two_questions_of_interview?: string | null
          user_id?: string
        }
        Relationships: []
      }
      linkedin_boolean_search: {
        Row: {
          apollo_id: string | null
          chat_id: string | null
          connection_request_time: string | null
          id: number
          invitation_id: string | null
          job_id: string
          linkedin_id: string
          recruiter_id: string
          status: string
          thread_id: string | null
          unipile_user_id: string
          user_id: string
        }
        Insert: {
          apollo_id?: string | null
          chat_id?: string | null
          connection_request_time?: string | null
          id?: number
          invitation_id?: string | null
          job_id: string
          linkedin_id: string
          recruiter_id: string
          status: string
          thread_id?: string | null
          unipile_user_id: string
          user_id?: string
        }
        Update: {
          apollo_id?: string | null
          chat_id?: string | null
          connection_request_time?: string | null
          id?: number
          invitation_id?: string | null
          job_id?: string
          linkedin_id?: string
          recruiter_id?: string
          status?: string
          thread_id?: string | null
          unipile_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_campaigns: {
        Row: {
          campaign_created_by: string | null
          campaign_id: string | null
          campaign_name: string | null
          companies: string | null
          created_time: string
          document_url: string | null
          enable_followups: boolean | null
          followup_days: number | null
          followup_messages: string[] | null
          id: number
          industries: string | null
          keywords: string | null
          last_updated_by: string | null
          locations: string | null
          opener_message: string | null
          status: string
          updated_time: string
        }
        Insert: {
          campaign_created_by?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          companies?: string | null
          created_time?: string
          document_url?: string | null
          enable_followups?: boolean | null
          followup_days?: number | null
          followup_messages?: string[] | null
          id?: number
          industries?: string | null
          keywords?: string | null
          last_updated_by?: string | null
          locations?: string | null
          opener_message?: string | null
          status?: string
          updated_time?: string
        }
        Update: {
          campaign_created_by?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          companies?: string | null
          created_time?: string
          document_url?: string | null
          enable_followups?: boolean | null
          followup_days?: number | null
          followup_messages?: string[] | null
          id?: number
          industries?: string | null
          keywords?: string | null
          last_updated_by?: string | null
          locations?: string | null
          opener_message?: string | null
          status?: string
          updated_time?: string
        }
        Relationships: []
      }
      linkedin_campaigns_leads: {
        Row: {
          action_date: string | null
          call_recording: string | null
          campaign_name: string | null
          chat_id: string | null
          company_name: string | null
          company_size: string | null
          created_by: string | null
          email: string | null
          full_name: string | null
          id: string
          invitation_id: string | null
          lead_type: string | null
          linkedin_id: string
          notes: string | null
          phone_number: string | null
          service: string | null
          source: string | null
          status: string | null
          thread_id: string | null
          unipile_user_id: string | null
        }
        Insert: {
          action_date?: string | null
          call_recording?: string | null
          campaign_name?: string | null
          chat_id?: string | null
          company_name?: string | null
          company_size?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          invitation_id?: string | null
          lead_type?: string | null
          linkedin_id: string
          notes?: string | null
          phone_number?: string | null
          service?: string | null
          source?: string | null
          status?: string | null
          thread_id?: string | null
          unipile_user_id?: string | null
        }
        Update: {
          action_date?: string | null
          call_recording?: string | null
          campaign_name?: string | null
          chat_id?: string | null
          company_name?: string | null
          company_size?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          invitation_id?: string | null
          lead_type?: string | null
          linkedin_id?: string
          notes?: string | null
          phone_number?: string | null
          service?: string | null
          source?: string | null
          status?: string | null
          thread_id?: string | null
          unipile_user_id?: string | null
        }
        Relationships: []
      }
      linkedin_connection_attempts: {
        Row: {
          account_id: string | null
          completed_at: string | null
          connection_name: string
          created_at: string | null
          error_message: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          connection_name: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          connection_name?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          user_id?: string
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
          linkedin_campaign: boolean
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
          linkedin_campaign?: boolean
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
          linkedin_campaign?: boolean
          linkedin_id?: string | null
          name?: string | null
          slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_device_tokens: {
        Row: {
          created_at: string | null
          device_token: string
          email_address: string | null
          id: string
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_token: string
          email_address?: string | null
          id?: string
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_token?: string
          email_address?: string | null
          id?: string
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qa_knowledge: {
        Row: {
          answer: string
          created_at: string | null
          embedding: string | null
          id: string
          job_id: string | null
          question: string
          source: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          job_id?: string | null
          question: string
          source?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          job_id?: string | null
          question?: string
          source?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      "Rejection table": {
        Row: {
          itris_job_id: string | null
          job_id: string
          recordid: string | null
          scheduled_time: string | null
          scheduled_time_iso: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          itris_job_id?: string | null
          job_id: string
          recordid?: string | null
          scheduled_time?: string | null
          scheduled_time_iso?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          itris_job_id?: string | null
          job_id?: string
          recordid?: string | null
          scheduled_time?: string | null
          scheduled_time_iso?: string | null
          status?: string | null
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
          name: string | null
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
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
      disable_expired_auto_dial: { Args: never; Returns: undefined }
      format_scheduled_time_iso: { Args: { ts: string }; Returns: string }
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
      has_org_role: {
        Args: {
          _role: Database["public"]["Enums"]["org_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_leader: { Args: { user_uuid: string }; Returns: boolean }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      org_role: "ADMIN" | "MANAGEMENT" | "EMPLOYEE" | "VIEWER"
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
      org_role: ["ADMIN", "MANAGEMENT", "EMPLOYEE", "VIEWER"],
      task_status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      user_role: ["TEAM_LEADER", "EMPLOYEE"],
    },
  },
} as const
