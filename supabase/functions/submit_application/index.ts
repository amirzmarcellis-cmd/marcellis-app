import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Basic validation and sanitization
    const clean = (v: unknown) =>
      typeof v === "string"
        ? v
            .replace(/\u0000/g, "")
            .replace(/[\u0001-\u0008\u000B-\u001F\u007F-\u009F]/g, "")
            .normalize("NFC")
            .trim()
        : "";

    if (!body.Firstname || !body.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Normalize email for lookup
    const normalizedEmail = clean(body.email).toLowerCase();

    // Check if email already exists
    const { data: existingCV, error: existingError } = await supabase
      .from("CVs")
      .select("user_id, cv_link, cv_text")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing CV:", existingError);
    }

    // If email already exists, update the record and return existing user_id
    if (existingCV) {
      console.log("Existing applicant found:", existingCV.user_id);
      
      const newCvLink = Array.isArray(body.cv_links) 
        ? body.cv_links.map((x: string) => clean(x)).join(", ") 
        : clean(body.cv_link || "");
      const newCvText = clean(body.cv_text || "");
      
      const updatePayload: Record<string, string> = {};
      
      if (newCvLink) {
        // Append new CV links to existing
        updatePayload.cv_link = existingCV.cv_link 
          ? `${existingCV.cv_link}, ${newCvLink}` 
          : newCvLink;
      }
      if (newCvText && newCvText !== existingCV.cv_text) {
        updatePayload.cv_text = newCvText;
      }
      
      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from("CVs")
          .update(updatePayload)
          .eq("user_id", existingCV.user_id);
        
        if (updateError) {
          console.error("Error updating existing CV:", updateError);
        }
      }
      
      // Trigger webhook for returning applicant
      const webhookPayload = {
        user_id: existingCV.user_id,
        Firstname: clean(body.Firstname),
        Lastname: clean(body.Lastname) || null,
        email: normalizedEmail,
        phone_number: clean(body.phone_number),
        job_id: clean(body.job_id),
        existing: true
      };

      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-push-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE}`
          },
          body: JSON.stringify(webhookPayload)
        });
      } catch (webhookError) {
        console.error("Webhook trigger failed (non-blocking):", webhookError);
      }

      return new Response(JSON.stringify({ 
        ok: true, 
        user_id: existingCV.user_id,
        existing: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate unique user_id server-side for new applicants
    const { data: existingCVs, error: queryError } = await supabase
      .from("CVs")
      .select("user_id")
      .like("user_id", "App%")
      .order("user_id", { ascending: false })
      .limit(1);

    if (queryError) {
      console.error("Error querying existing CVs:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to generate application ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let nextNumber = 1;
    if (existingCVs && existingCVs.length > 0) {
      const lastId = existingCVs[0].user_id;
      const match = lastId?.match(/App(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const user_id = `App${String(nextNumber).padStart(4, "0")}`;

    const payload = {
      user_id,
      Firstname: clean(body.Firstname),
      Lastname: clean(body.Lastname) || null,
      name: clean(body.name),
      email: normalizedEmail,
      phone_number: clean(body.phone_number),
      notes: "",
      job_id: clean(body.job_id),
      cv_text: clean(body.cv_text || ""),
      cv_link: Array.isArray(body.cv_links) ? body.cv_links.map((x: string) => clean(x)).join(", ") : clean(body.cv_link || ""),
    };

    const { error } = await supabase.from("CVs").insert([payload]);
    if (error) {
      console.error("submit_application insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger webhook for new applicant
    const newWebhookPayload = {
      user_id,
      Firstname: clean(body.Firstname),
      Lastname: clean(body.Lastname) || null,
      email: normalizedEmail,
      phone_number: clean(body.phone_number),
      job_id: clean(body.job_id),
      existing: false
    };

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-push-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE}`
        },
        body: JSON.stringify(newWebhookPayload)
      });
    } catch (webhookError) {
      console.error("Webhook trigger failed (non-blocking):", webhookError);
    }

    return new Response(JSON.stringify({ ok: true, user_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("submit_application error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
