import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { savePushToken } from '@/lib/pushToken';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Save push token on sign in (deferred to avoid blocking auth flow)
        if (event === 'SIGNED_IN' && session?.user?.id) {
          setTimeout(() => {
            savePushToken(session.user.id);
          }, 0);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear local state first
      setSession(null);
      setUser(null);
      
      // Sign out from Supabase with global scope to revoke all tokens
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      // Don't treat "session missing" as an error - it's expected if session expired
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error signing out:', error);
      }
      
      // Force clear all auth-related items from localStorage
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') || key.includes('auth-token')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Wait a moment for session to clear from localStorage
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Now redirect
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      setSession(null);
      setUser(null);
      
      // Force cleanup on error - clear all auth-related keys
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') || key.includes('auth-token')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Wait before redirect even on error
      await new Promise(resolve => setTimeout(resolve, 150));
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}