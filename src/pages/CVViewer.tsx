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

        // Fetch formatted CV from CVs table
        const { data: cvData, error: cvError } = await supabase
          .from("CVs")
          .select("formatted_cv, name")
          .eq("user_id", candidateId)
          .single();

        if (cvError) {
          console.error("Error fetching from CVs table:", cvError);
          setCvText("No CV available");
          setCandidateName(candidateId);
        } else {
          setCvText(cvData?.formatted_cv || "No CV available");
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
          onClick={() => navigate(`/candidate/${candidateId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidate
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 border-b border-border/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">Curriculum Vitae</h2>
            <p className="text-muted-foreground">Professional Profile</p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
          <div 
            className="cv-content prose prose-neutral dark:prose-invert max-w-none"
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.75',
            }}
          >
            {cvText.split('\n').map((line, index) => {
              const cleanLine = line
                .replace(/[•●▪◦▸▹►▻]/g, '•')
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                .trim();
              
              if (!cleanLine) {
                return <div key={index} className="h-4" />;
              }
              
              const isHeader = cleanLine === cleanLine.toUpperCase() && cleanLine.length > 3 && cleanLine.length < 50;
              const isSubHeader = cleanLine.endsWith(':') && cleanLine.length < 100;
              
              if (isHeader) {
                return (
                  <h2 key={index} className="text-xl font-bold text-primary mt-8 mb-4 pb-2 border-b-2 border-primary/20 uppercase tracking-wide">
                    {cleanLine}
                  </h2>
                );
              }
              
              if (isSubHeader) {
                return (
                  <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
                    {cleanLine}
                  </h3>
                );
              }
              
              if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                return (
                  <div key={index} className="flex gap-3 ml-6 mb-2 text-muted-foreground">
                    <span className="text-primary font-bold mt-1.5 text-sm">●</span>
                    <span className="flex-1 leading-relaxed">{cleanLine.replace(/^[•\-*]\s*/, '')}</span>
                  </div>
                );
              }
              
              return (
                <p key={index} className="text-foreground leading-relaxed mb-3">
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
