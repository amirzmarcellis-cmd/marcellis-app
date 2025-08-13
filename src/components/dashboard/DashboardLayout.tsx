import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./Sidebar"
import { MissionBackground } from "@/components/layout/MissionBackground"
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background overflow-x-auto">
        <DashboardSidebar />
        <SidebarInset className="flex-1 relative">
          <MissionBackground>
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <div className="flex-1" />
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span>Live Dashboard</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6">
              {children}
            </main>
          </MissionBackground>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}