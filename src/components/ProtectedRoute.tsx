import { ReactNode } from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiresAnalytics?: boolean;
  requiresJobsAnalytics?: boolean;
  requiresUsersPanel?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiresAnalytics = false,
  requiresJobsAnalytics = false,
  requiresUsersPanel = false,
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { 
    hasRole, 
    canAccessAnalytics,
    canAccessJobsAnalytics,
    canAccessUsersPanel, 
    loading 
  } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    let hasAccess = true;

    if (requiredRole) {
      hasAccess = hasRole(requiredRole);
    }

    if (requiresAnalytics) {
      hasAccess = hasAccess && canAccessAnalytics;
    }

    if (requiresJobsAnalytics) {
      hasAccess = hasAccess && canAccessJobsAnalytics;
    }

    if (requiresUsersPanel) {
      hasAccess = hasAccess && canAccessUsersPanel;
    }

    if (!hasAccess) {
      navigate(fallbackPath, { replace: true });
    }
  }, [
    hasRole, 
    canAccessAnalytics,
    canAccessJobsAnalytics,
    canAccessUsersPanel, 
    requiredRole, 
    requiresAnalytics,
    requiresJobsAnalytics,
    requiresUsersPanel, 
    loading, 
    navigate, 
    fallbackPath
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Additional check for invalid access
  let hasAccess = true;

  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  }

  if (requiresAnalytics) {
    hasAccess = hasAccess && canAccessAnalytics;
  }

  if (requiresJobsAnalytics) {
    hasAccess = hasAccess && canAccessJobsAnalytics;
  }

  if (requiresUsersPanel) {
    hasAccess = hasAccess && canAccessUsersPanel;
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate(fallbackPath)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}