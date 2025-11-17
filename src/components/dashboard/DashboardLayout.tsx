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

  // Don't block rendering on auth check - redirect happens in ProtectedRoute
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
      <div className="min-h-screen flex w-full bg-gradient-hero overflow-x-auto">
        <DashboardSidebar />
        <SidebarInset className="flex-1 relative">
          <MissionBackground>
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
              <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-9 w-9 sm:h-10 sm:w-10" />
                <div className="flex-1" />
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm font-light text-muted-foreground">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse"></div>
                    <span>Live Dashboard</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </MissionBackground>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}