import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
// Company context removed - using simple admin system
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import JobDetails from "./pages/JobDetails";
import Candidates from "./pages/Candidates";
import EditCandidate from "./pages/EditCandidate";
import CandidateDetails from "./pages/CandidateDetails";
import Calls from "./pages/Calls";
import CallLog from "./pages/CallLog";
import CallLogDetails from "./pages/CallLogDetails";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LiveCandidateFeed from "./pages/LiveCandidateFeed";
import Interviews from "./pages/Interviews";
import Tasks from "./pages/Tasks";
import Apply from "./pages/Apply";
import UsersPanel from "./pages/UsersPanel";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CompanySettings from "./pages/CompanySettings";
import PlatformAdmin from "./pages/PlatformAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        
          <AppSettingsProvider>
            <TooltipProvider delayDuration={200} skipDelayDuration={300}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/apply" element={<Apply />} />
                  <Route path="/apply/:subdomain" element={<Apply />} />
                  <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
                  <Route path="/live-feed" element={<DashboardLayout><LiveCandidateFeed /></DashboardLayout>} />
                  <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
                  <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
                  <Route path="/jobs/add" element={<DashboardLayout><AddJob /></DashboardLayout>} />
                  <Route path="/jobs/edit/:id" element={<DashboardLayout><EditJob /></DashboardLayout>} />
                  <Route path="/job/:id" element={<DashboardLayout><JobDetails /></DashboardLayout>} />
                  <Route path="/job/:id/apply" element={<Apply />} />
                  <Route path="/candidates" element={<DashboardLayout><Candidates /></DashboardLayout>} />
                  <Route path="/interviews" element={<DashboardLayout><Interviews /></DashboardLayout>} />
                  <Route path="/candidate/:id" element={<DashboardLayout><CandidateDetails /></DashboardLayout>} />
                  <Route path="/candidate/edit/:id" element={<DashboardLayout><EditCandidate /></DashboardLayout>} />
                  <Route path="/calls" element={<DashboardLayout><Calls /></DashboardLayout>} />
                  <Route path="/call-log" element={<DashboardLayout><CallLog /></DashboardLayout>} />
                  <Route path="/call-log-details" element={<DashboardLayout><CallLogDetails /></DashboardLayout>} />
                  <Route path="/analytics" element={
                    <ProtectedRoute requiresAnalytics={true}>
                      <DashboardLayout><Analytics /></DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/performance" element={<DashboardLayout><Performance /></DashboardLayout>} />
                  <Route path="/reports" element={
                    <ProtectedRoute requiresAnalytics={true}>
                      <DashboardLayout><Reports /></DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
                  <Route path="/users-panel" element={
                    <ProtectedRoute requiresUsersPanel={true}>
                      <DashboardLayout><UsersPanel /></DashboardLayout>
                    </ProtectedRoute>
                  } />
                   <Route path="/company-settings" element={
                     <ProtectedRoute>
                       <DashboardLayout><CompanySettings /></DashboardLayout>
                     </ProtectedRoute>
                   } />
                   <Route path="/platform-admin" element={
                     <ProtectedRoute>
                       <DashboardLayout><PlatformAdmin /></DashboardLayout>
                     </ProtectedRoute>
                   } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AppSettingsProvider>
        
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;