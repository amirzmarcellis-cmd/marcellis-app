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
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Active Calls", url: "/calls", icon: Phone },
  { title: "Call Log", url: "/call-log", icon: FileText },
  { title: "Candidates", url: "/candidates", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Performance", url: "/performance", icon: TrendingUp },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function DashboardSidebar() {
  const { state } = useSidebar()
  const { signOut } = useAuth();
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const hasActiveItem = navigationItems.some((item) => isActive(item.url))

  return (
    <Sidebar
      className="border-r border-border bg-card/50 backdrop-blur-sm"
      collapsible="icon"
    >
      <SidebarContent className="bg-transparent">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">AIZCRM</h2>
                <p className="text-xs text-muted-foreground">AI Recruiter</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${
                          isActive(item.url)
                            ? "bg-primary text-primary-foreground shadow-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }
                        ${isCollapsed ? "justify-center" : ""}
                      `}
                    >
                      <item.icon 
                        className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} 
                      />
                      {!isCollapsed && (
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
          {!isCollapsed && (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">System Online</span>
              </div>
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
          {isCollapsed && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
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