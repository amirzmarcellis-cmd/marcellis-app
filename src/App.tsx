import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import JobDetails from "./pages/JobDetails";
import Candidates from "./pages/Candidates";
import EditCandidate from "./pages/EditCandidate";
import CandidateDetails from "./pages/CandidateDetails";
import Calls from "./pages/Calls";
import CallLog from "./pages/CallLog";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LiveCandidateFeed from "./pages/LiveCandidateFeed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
              <Route path="/live-feed" element={<DashboardLayout><LiveCandidateFeed /></DashboardLayout>} />
              <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
              <Route path="/jobs/add" element={<DashboardLayout><AddJob /></DashboardLayout>} />
              <Route path="/job/:id" element={<DashboardLayout><JobDetails /></DashboardLayout>} />
              <Route path="/candidates" element={<DashboardLayout><Candidates /></DashboardLayout>} />
              <Route path="/candidate/:id" element={<DashboardLayout><CandidateDetails /></DashboardLayout>} />
              <Route path="/candidate/edit/:id" element={<DashboardLayout><EditCandidate /></DashboardLayout>} />
              <Route path="/calls" element={<DashboardLayout><Calls /></DashboardLayout>} />
              <Route path="/call-log" element={<DashboardLayout><CallLog /></DashboardLayout>} />
              <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
              <Route path="/performance" element={<DashboardLayout><Performance /></DashboardLayout>} />
              <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
              <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;