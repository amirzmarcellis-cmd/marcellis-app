import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JobManagementPanel } from "@/components/jobs/JobManagementPanel";

export default function Jobs() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => navigate("/jobs/add")}
          className="mb-6"
        >
          Add Job
        </Button>
      </div>

      <div>
        <JobManagementPanel />
      </div>
    </div>
  );
}