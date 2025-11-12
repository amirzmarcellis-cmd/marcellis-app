import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useTheme } from "next-themes";
import defaultLogo from "@/assets/default-logo.png";

export default function RedirectWebhook() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const { theme } = useTheme();

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
        <div className="text-center space-y-6">
          <div className="w-48 h-48 mx-auto">
            <img 
              src={theme === 'dark' 
                ? (settings.logoLight || settings.logo || defaultLogo)
                : (settings.logoDark || settings.logo || defaultLogo)} 
              alt="Company Logo" 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <p className="text-destructive text-lg">Missing required parameters</p>
          <p className="text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="w-48 h-48 mx-auto">
          <img 
            src={theme === 'dark' 
              ? (settings.logoLight || settings.logo || defaultLogo)
              : (settings.logoDark || settings.logo || defaultLogo)} 
            alt="Company Logo" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
