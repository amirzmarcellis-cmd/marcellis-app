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

    // Generate unique user_id server-side
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
      email: clean(body.email),
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