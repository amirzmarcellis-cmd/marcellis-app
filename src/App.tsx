import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Groups = lazy(() => import("./pages/Groups"));
const Clients = lazy(() => import("./pages/Clients"));
const AddJob = lazy(() => import("./pages/AddJob"));
const EditJob = lazy(() => import("./pages/EditJob"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Candidates = lazy(() => import("./pages/Candidates"));
const EditCandidate = lazy(() => import("./pages/EditCandidate"));
const CandidateDetails = lazy(() => import("./pages/CandidateDetails"));
const CVViewer = lazy(() => import("./pages/CVViewer"));
const Calls = lazy(() => import("./pages/Calls"));
const CallLog = lazy(() => import("./pages/CallLog"));
const CallLogDetails = lazy(() => import("./pages/CallLogDetails"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Performance = lazy(() => import("./pages/Performance"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const LiveCandidateFeed = lazy(() => import("./pages/LiveCandidateFeed"));
const Interviews = lazy(() => import("./pages/Interviews"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Apply = lazy(() => import("./pages/Apply"));
const UsersPanel = lazy(() => import("./pages/UsersPanel"));
const TeamUsers = lazy(() => import("./pages/TeamUsers"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <AppSettingsProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/apply" element={<Apply />} />
                  <Route path="/apply/:subdomain" element={<Apply />} />
                  <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
                  <Route path="/live-feed" element={<DashboardLayout><LiveCandidateFeed /></DashboardLayout>} />
                  <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
                  <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
                  <Route path="/groups" element={<DashboardLayout><Groups /></DashboardLayout>} />
                  <Route path="/clients" element={<DashboardLayout><Clients /></DashboardLayout>} />
                  <Route path="/jobs/add" element={<DashboardLayout><AddJob /></DashboardLayout>} />
                  <Route path="/jobs/edit/:id" element={<DashboardLayout><EditJob /></DashboardLayout>} />
                  <Route path="/job/:id" element={<DashboardLayout><JobDetails /></DashboardLayout>} />
                  <Route path="/job/:id/apply" element={<Apply />} />
                  <Route path="/candidates" element={<DashboardLayout><Candidates /></DashboardLayout>} />
                  <Route path="/interviews" element={<DashboardLayout><Interviews /></DashboardLayout>} />
                  <Route path="/candidate/:id" element={<DashboardLayout><CandidateDetails /></DashboardLayout>} />
                  <Route path="/candidate/edit/:id" element={<DashboardLayout><EditCandidate /></DashboardLayout>} />
                  <Route path="/cv-viewer/:candidateId/:jobId" element={<DashboardLayout><CVViewer /></DashboardLayout>} />
                  <Route path="/calls" element={<DashboardLayout><Calls /></DashboardLayout>} />
                  <Route path="/call-log" element={<DashboardLayout><CallLog /></DashboardLayout>} />
                  <Route path="/call-log-details" element={<DashboardLayout><CallLogDetails /></DashboardLayout>} />
                  <Route path="/call-log-details/:recordid" element={<DashboardLayout><CallLogDetails /></DashboardLayout>} />
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
                  <Route path="/team-users" element={
                    <DashboardLayout><TeamUsers /></DashboardLayout>
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AppSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;