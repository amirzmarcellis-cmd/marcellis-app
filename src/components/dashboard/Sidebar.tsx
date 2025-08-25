import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  BarChart3,
  Phone,
  Users,
  Settings,
  Home,
  TrendingUp,
  Calendar,
  FileText,
  Briefcase,
  LogOut,
  PhoneCall,
  Activity,
  Sun,
  Moon,
  ClipboardList,
  Building2,
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { CompanySwitcher } from '@/components/company/CompanySwitcher';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Moved navigationItems inside component to access context hooks

export function DashboardSidebar() {
  const { state } = useSidebar()
  const { signOut } = useAuth();
  const { settings } = useAppSettings();
  const { canAccessAnalytics } = useUserRole();
  const { canManageUsers, isPlatformAdmin } = useCompanyContext();
  const { theme, setTheme } = useTheme();
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  const isMobile = useIsMobile()
  const isMini = isCollapsed && !isMobile

  // Platform admin gets different navigation
  const platformAdminNavigation = [
    { title: "Companies", url: "/platform-admin", icon: Building2 },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  // Regular company navigation
  const companyNavigation = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Interviews", url: "/interviews", icon: Calendar },
    { title: "Live Feed", url: "/live-feed", icon: Activity },
    { title: "Tasks", url: "/tasks", icon: ClipboardList },
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Candidates", url: "/candidates", icon: Users },
    { title: "Call Log", url: "/call-log", icon: PhoneCall },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Reports", url: "/reports", icon: FileText },
    ...(isPlatformAdmin() ? [{ title: "Company Settings", url: "/company-settings", icon: Building2 }] : []),
    ...(canManageUsers() ? [{ title: "Users", url: "/users-panel", icon: Users }] : []),
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const navigationItems = isPlatformAdmin() ? platformAdminNavigation : companyNavigation;

  const isActive = (path: string) => currentPath === path
  const hasActiveItem = navigationItems.some((item) => isActive(item.url))

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar
      className="border-r border-border"
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <SidebarContent className="bg-sidebar-background">
        {/* Header */}
        <div className="py-6 px-0 border-b border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className={`${isMini ? 'w-full h-16' : 'w-full h-20'} flex items-center justify-center transition-all duration-200`}>
                {(() => {
                  const displayLogo = theme === 'dark'
                    ? (settings.logoLight || settings.logo || settings.primaryColor)
                    : (settings.logoDark || settings.logo || settings.primaryColor);
                  return displayLogo ? (
                    <img 
                      src={displayLogo as string}
                      alt="Company Logo" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <Phone className={`${isMini ? 'w-10 h-10' : 'w-16 h-16'} text-primary`} />
                  );
                })()}
              </div>
            </div>
            {!isMini && !isPlatformAdmin() && (
              <div className="px-3">
                <CompanySwitcher />
              </div>
            )}
            {!isMini && isPlatformAdmin() && (
              <div className="px-3 text-center">
                <div className="text-sm font-medium text-foreground">Platform Admin</div>
                <div className="text-xs text-muted-foreground">System Management</div>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={isMini ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems
                .filter((item) => {
                  // Filter out Analytics and Reports for recruiters
                  if ((item.title === 'Analytics' || item.title === 'Reports') && !canAccessAnalytics) {
                    return false;
                  }
                  return true;
                })
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                          ${
                            isActive(item.url)
                              ? "bg-muted text-foreground shadow-medium dark:bg-primary dark:text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }
                        ${isMini ? "justify-center" : ""}
                      `}
                    >
                      <item.icon 
                        className={`w-5 h-5 ${isMini ? "" : "mr-3"}`} 
                      />
                      {!isMini && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status indicator and sign out */}
        <div className="p-4 border-t border-border space-y-3">
          {!isMini && (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">System Online</span>
              </div>
              
              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 mr-3" />
                ) : (
                  <Moon className="w-4 h-4 mr-3" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              
              <Button
                onClick={signOut}
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </>
          )}
          {isMini && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              
              {/* Theme Toggle - Collapsed */}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}