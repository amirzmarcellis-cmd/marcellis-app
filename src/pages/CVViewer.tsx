import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { toast } from "sonner";

export default function CVViewer() {
  const { candidateId, jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cvText, setCvText] = useState<string>("");
  const [candidateName, setCandidateName] = useState<string>("");

  useEffect(() => {
    const fetchCVData = async () => {
      if (!candidateId || !jobId) return;

      try {
        // First, trigger the webhook
        const { data: jobCvData } = await supabase
          .from("Jobs_CVs")
          .select("itris_job_id")
          .eq("job_id", jobId)
          .eq("user_id", candidateId)
          .single();

        if (jobCvData?.itris_job_id) {
          await fetch("https://hook.eu2.make.com/3xzjwgget94o2nco3rsm3ix9jm42pyuu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itris_job_id: jobCvData.itris_job_id,
              candidate_id: candidateId,
              job_id: jobId,
            }),
          });
        }

        // Fetch CV text from CVs table
        const { data: cvData, error: cvError } = await supabase
          .from("CVs")
          .select("cv_text, name")
          .eq("user_id", candidateId)
          .single();

        if (cvError) {
          console.error("Error fetching from CVs table:", cvError);
          setCvText("No CV text available");
          setCandidateName(candidateId);
        } else {
          setCvText(cvData?.cv_text || "No CV text available");
          setCandidateName(cvData?.name || candidateId);
        }
      } catch (error) {
        console.error("Error fetching CV:", error);
        toast.error("Failed to load CV");
        setCvText("Error loading CV text");
      } finally {
        setLoading(false);
      }
    };

    fetchCVData();
  }, [candidateId, jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title={`CV - ${candidateName}`} />
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <GlassCard className="p-8">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {cvText}
          </pre>
        </div>
      </GlassCard>
    </div>
  );
}
