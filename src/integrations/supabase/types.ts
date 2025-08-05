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
          "Applied for": string | null
          Cadndidate_ID: string
          Certifications: string | null
          "Current Company": string | null
          "CV Summary": string | null
          CV_Link: string | null
          "Done Questions": string | null
          Education: string | null
          Email: string | null
          Experience: string | null
          "First Name": string | null
          Language: string | null
          "Last Name": string | null
          Linkedin: string | null
          Location: string | null
          "Other Notes": string | null
          "Phone Number": string | null
          Skills: string | null
          Timestamp: string | null
          Title: string | null
        }
        Insert: {
          "Applied for"?: string | null
          Cadndidate_ID: string
          Certifications?: string | null
          "Current Company"?: string | null
          "CV Summary"?: string | null
          CV_Link?: string | null
          "Done Questions"?: string | null
          Education?: string | null
          Email?: string | null
          Experience?: string | null
          "First Name"?: string | null
          Language?: string | null
          "Last Name"?: string | null
          Linkedin?: string | null
          Location?: string | null
          "Other Notes"?: string | null
          "Phone Number"?: string | null
          Skills?: string | null
          Timestamp?: string | null
          Title?: string | null
        }
        Update: {
          "Applied for"?: string | null
          Cadndidate_ID?: string
          Certifications?: string | null
          "Current Company"?: string | null
          "CV Summary"?: string | null
          CV_Link?: string | null
          "Done Questions"?: string | null
          Education?: string | null
          Email?: string | null
          Experience?: string | null
          "First Name"?: string | null
          Language?: string | null
          "Last Name"?: string | null
          Linkedin?: string | null
          Location?: string | null
          "Other Notes"?: string | null
          "Phone Number"?: string | null
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
          "Client Description": string | null
          "Criteria to evaluate by": string | null
          "JD Summary": string | null
          "Job Description": string | null
          "Job ID": string
          "Job Location": string | null
          "Job Salary Range (ex: 15000 AED)": string | null
          "Job Title": string | null
          Processed: string | null
          "Things to look for": string | null
          Timestamp: string | null
        }
        Insert: {
          "Client Description"?: string | null
          "Criteria to evaluate by"?: string | null
          "JD Summary"?: string | null
          "Job Description"?: string | null
          "Job ID": string
          "Job Location"?: string | null
          "Job Salary Range (ex: 15000 AED)"?: string | null
          "Job Title"?: string | null
          Processed?: string | null
          "Things to look for"?: string | null
          Timestamp?: string | null
        }
        Update: {
          "Client Description"?: string | null
          "Criteria to evaluate by"?: string | null
          "JD Summary"?: string | null
          "Job Description"?: string | null
          "Job ID"?: string
          "Job Location"?: string | null
          "Job Salary Range (ex: 15000 AED)"?: string | null
          "Job Title"?: string | null
          Processed?: string | null
          "Things to look for"?: string | null
          Timestamp?: string | null
        }
        Relationships: []
      }
      Jobs_CVs: {
        Row: {
          "2 Questions of Interview": string | null
          "Agency Experience": string | null
          callid: number
          "Candidate Email": string | null
          "Candidate Name": string | null
          "Candidate Phone Number": string | null
          Candidate_ID: string | null
          cons: string | null
          Contacted: string | null
          CV_Link: string | null
          "Job ID": string | null
          "Notice Period": string | null
          pros: string | null
          "Relatable CV?": string | null
          "Salary Expectations": string | null
          "Score and Reason": string | null
          "Success Score": string | null
          Summary: string | null
          Transcript: string | null
        }
        Insert: {
          "2 Questions of Interview"?: string | null
          "Agency Experience"?: string | null
          callid?: number
          "Candidate Email"?: string | null
          "Candidate Name"?: string | null
          "Candidate Phone Number"?: string | null
          Candidate_ID?: string | null
          cons?: string | null
          Contacted?: string | null
          CV_Link?: string | null
          "Job ID"?: string | null
          "Notice Period"?: string | null
          pros?: string | null
          "Relatable CV?"?: string | null
          "Salary Expectations"?: string | null
          "Score and Reason"?: string | null
          "Success Score"?: string | null
          Summary?: string | null
          Transcript?: string | null
        }
        Update: {
          "2 Questions of Interview"?: string | null
          "Agency Experience"?: string | null
          callid?: number
          "Candidate Email"?: string | null
          "Candidate Name"?: string | null
          "Candidate Phone Number"?: string | null
          Candidate_ID?: string | null
          cons?: string | null
          Contacted?: string | null
          CV_Link?: string | null
          "Job ID"?: string | null
          "Notice Period"?: string | null
          pros?: string | null
          "Relatable CV?"?: string | null
          "Salary Expectations"?: string | null
          "Score and Reason"?: string | null
          "Success Score"?: string | null
          Summary?: string | null
          Transcript?: string | null
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
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
