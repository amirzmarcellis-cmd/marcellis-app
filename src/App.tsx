import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
// import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Calls from "./pages/Calls";
import CallLog from "./pages/CallLog";
import Candidates from "./pages/Candidates";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CandidateDetails from "./pages/CandidateDetails";
import JobDetails from "./pages/JobDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
            <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
            <Route path="/calls" element={<DashboardLayout><Calls /></DashboardLayout>} />
            <Route path="/call-log" element={<DashboardLayout><CallLog /></DashboardLayout>} />
            <Route path="/candidates" element={<DashboardLayout><Candidates /></DashboardLayout>} />
            <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/performance" element={<DashboardLayout><Performance /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/candidate/:id" element={<CandidateDetails />} />
            <Route path="/job/:id" element={<JobDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
