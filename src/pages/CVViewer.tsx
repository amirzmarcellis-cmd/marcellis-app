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
        <div className="max-w-4xl mx-auto">
          <div 
            className="cv-content space-y-4"
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              fontSize: '0.95rem',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {cvText.split('\n').map((line, index) => {
              // Clean the line
              const cleanLine = line
                .replace(/[•●▪◦▸▹►▻]/g, '•')  // Normalize bullet points
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
                .trim();
              
              // Skip empty lines
              if (!cleanLine) {
                return <div key={index} className="h-3" />;
              }
              
              // Detect section headers (all caps or ends with colon)
              const isHeader = cleanLine === cleanLine.toUpperCase() && cleanLine.length > 3 && cleanLine.length < 50;
              const isSubHeader = cleanLine.endsWith(':') && cleanLine.length < 100;
              
              if (isHeader) {
                return (
                  <h2 key={index} className="text-lg font-bold text-primary mt-6 mb-2 border-b border-border pb-2">
                    {cleanLine}
                  </h2>
                );
              }
              
              if (isSubHeader) {
                return (
                  <h3 key={index} className="text-base font-semibold text-foreground mt-4 mb-1">
                    {cleanLine}
                  </h3>
                );
              }
              
              // Bullet points
              if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                return (
                  <div key={index} className="flex gap-3 ml-4 text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{cleanLine.replace(/^[•\-*]\s*/, '')}</span>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={index} className="text-foreground leading-relaxed">
                  {cleanLine}
                </p>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
