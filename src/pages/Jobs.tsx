import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobManagementPanel } from "@/components/jobs/JobManagementPanel";
import { JobAnalytics } from "@/components/jobs/JobAnalytics";

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("all-jobs");

  return (
    <div className="space-y-6 overflow-x-hidden w-full px-2 sm:px-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Job Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-jobs">
          <JobManagementPanel />
        </TabsContent>
        
        <TabsContent value="analytics">
          <JobAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}