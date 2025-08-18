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
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';
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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Interviews", url: "/interviews", icon: Calendar },
  { title: "Live Feed", url: "/live-feed", icon: Activity },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Candidates", url: "/candidates", icon: Users },
  { title: "Call Log", url: "/call-log", icon: PhoneCall },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function DashboardSidebar() {
  const { state } = useSidebar()
  const { signOut } = useAuth();
  const { settings } = useAppSettings();
  const { canAccessAnalytics } = useUserRole();
  const { theme, setTheme } = useTheme();
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  const isMobile = useIsMobile()
  const isMini = isCollapsed && !isMobile

  const isActive = (path: string) => currentPath === path
  const hasActiveItem = navigationItems.some((item) => isActive(item.url))

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar
      className="border-r border-border bg-card/50 backdrop-blur-sm"
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <SidebarContent className="bg-transparent">
        {/* Header */}
        <div className="py-6 px-0 border-b border-border">
          <div className="flex items-center justify-center">
            <div className={`${isMini ? 'w-full h-16' : 'w-full h-28'} flex items-center justify-center transition-all duration-200`}>
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
                  <Phone className={`${isMini ? 'w-10 h-10' : 'w-20 h-20'} text-primary`} />
                );
              })()}
            </div>
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