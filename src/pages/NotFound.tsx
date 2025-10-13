import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MissionBackground } from "@/components/layout/MissionBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MissionBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-light font-work tracking-tight">404</h1>
          <p className="text-2xl font-light font-inter text-muted-foreground mb-4">Oops! Page not found</p>
          <a href="/" className="text-primary underline font-light font-inter">
            Return to Home
          </a>
        </div>
      </div>
    </MissionBackground>
  );
};

export default NotFound;
