import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Activity, Users, Briefcase } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export function WelcomeHeader() {
  const { profile } = useProfile();
  
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple text-white';
      case 'manager': return 'bg-blue text-white';
      case 'recruiter': return 'bg-cyan text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="mission-card p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
              {profile?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="text-glow">Welcome back, </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {profile?.name || 'Recruiter'}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg mb-2">{currentDate}</p>
            <div className="flex items-center space-x-3">
              <Badge className="bg-primary text-primary-foreground">
                User
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end space-x-2 text-primary text-xl font-mono mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-glow">{currentTime}</span>
          </div>
          
          <div className="flex items-center justify-end space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="status-indicator status-active" />
              <span>Mission Control Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
            <Activity className="h-5 w-5 text-cyan" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Today</p>
            <p className="text-xl font-semibold text-cyan">24 calls</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue/10 border border-blue/20">
            <Users className="h-5 w-5 text-blue" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">New Candidates</p>
            <p className="text-xl font-semibold text-blue">12 today</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple/10 border border-purple/20">
            <Briefcase className="h-5 w-5 text-purple" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Open Positions</p>
            <p className="text-xl font-semibold text-purple">8 active</p>
          </div>
        </div>
      </div>
    </div>
  );
}