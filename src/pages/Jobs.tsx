import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JobManagementPanel } from "@/components/jobs/JobManagementPanel";

export default function Jobs() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 overflow-x-auto">
      <div>
        <JobManagementPanel />
      </div>
    </div>
  );
}