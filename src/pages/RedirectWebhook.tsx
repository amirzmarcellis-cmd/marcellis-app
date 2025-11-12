import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function RedirectWebhook() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = searchParams.get("user_id");
    const jobId = searchParams.get("job_id");

    if (!userId || !jobId) {
      // Show error for a moment then redirect to home
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    // Redirect to call-candidate page with the same params
    navigate(`/call-candidate?user_id=${userId}&job_id=${jobId}`);
  }, [searchParams, navigate]);

  const userId = searchParams.get("user_id");
  const jobId = searchParams.get("job_id");

  if (!userId || !jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">Missing required parameters</p>
          <p className="text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
