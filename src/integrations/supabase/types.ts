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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
