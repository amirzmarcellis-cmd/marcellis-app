import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recordid } = await req.json();
    
    if (!recordid) {
      console.error("Missing recordid parameter");
      return new Response(
        JSON.stringify({ error: "Missing recordid parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing salary note generation for recordid: ${recordid}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the transcript and candidate name from Jobs_CVs
    const { data: jobCvData, error: fetchError } = await supabase
      .from("Jobs_CVs")
      .select("transcript, candidate_name, current_salary, salary_expectations")
      .eq("recordid", recordid)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching Jobs_CVs:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch record", details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobCvData) {
      console.error("Record not found for recordid:", recordid);
      return new Response(
        JSON.stringify({ error: "Record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobCvData.transcript) {
      console.log("No transcript available for recordid:", recordid);
      return new Response(
        JSON.stringify({ error: "No transcript available for this record" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Transcript found, calling Lovable AI for analysis...");
    console.log("Candidate name:", jobCvData.candidate_name);

    // Call Lovable AI to analyze the transcript
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert at analyzing interview call transcripts to extract salary information.

Your task is to analyze the transcript and extract:
1. The candidate's CURRENT salary (amount and currency)
2. The candidate's EXPECTED salary (amount and currency)

CRITICAL RULES:
- Use the EXACT currency mentioned by the candidate (AED, SAR, INR, USD, EUR, GBP, PKR, EGP, etc.)
- Do NOT convert currencies - keep them as stated
- If currency is not explicitly stated, infer from context (e.g., UAE job = AED, Saudi job = SAR, India = INR)
- Format numbers with commas for readability (e.g., 30,000 not 30000)
- If a range is mentioned, include the full range (e.g., "40,000-45,000")
- Use "per month" or "per annum" as mentioned by the candidate

Generate a natural, professional salary note in this format:
"[Candidate Name]'s current salary is [amount] [currency] per [period], and [his/her] expected salary is [amount] [currency] per [period]."

If only one salary is mentioned, adjust the format accordingly.
If no salary information is found, respond with: "No salary information discussed in the transcript."`;

    const userPrompt = `Analyze this interview transcript and extract salary information for candidate: ${jobCvData.candidate_name || "the candidate"}

TRANSCRIPT:
${jobCvData.transcript}

Generate a salary note based on the salary information discussed in this transcript.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const salaryNote = aiData.choices?.[0]?.message?.content?.trim();

    if (!salaryNote) {
      console.error("No response from AI");
      return new Response(
        JSON.stringify({ error: "AI did not generate a response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generated salary note:", salaryNote);

    // Update the Jobs_CVs record with the generated salary note
    const { error: updateError } = await supabase
      .from("Jobs_CVs")
      .update({ salary_note: salaryNote })
      .eq("recordid", recordid);

    if (updateError) {
      console.error("Error updating salary_note:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save salary note", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Salary note saved successfully for recordid:", recordid);

    return new Response(
      JSON.stringify({ success: true, salary_note: salaryNote }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
