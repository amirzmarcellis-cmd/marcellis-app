import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import defaultLogo from '@/assets/default-logo.png';
import { MissionBackground } from '@/components/layout/MissionBackground';
import { useTheme } from 'next-themes';
export default function Auth() {
  const { settings } = useAppSettings();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate email domain
      const emailDomain = email.split('@')[1];
      if (emailDomain !== 'marc-ellis.com') {
        throw new Error('Only @marc-ellis.com email addresses are allowed to access this platform');
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
      }
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        <MissionBackground className="absolute inset-0" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 flex items-center justify-center">
                <img 
                  src={theme === 'dark' 
                    ? (settings.logoLight || settings.logo || defaultLogo)
                    : (settings.logoDark || settings.logo || defaultLogo)} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                  fetchPriority="high"
                />
              </div>
            </div>
            <h1 className="text-4xl font-light text-foreground text-center mb-2">Welcome back!</h1>
            <p className="text-center text-muted-foreground">
              Log in now and save time on employee administration.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 border-border/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50 border-border/50 backdrop-blur-sm"
              />
              <div className="flex justify-end">
                <button type="button" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium h-12 rounded-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign in' : 'Sign Up'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Visual Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden items-center justify-center p-12">
        {/* Central Content Container */}
        <div className="relative">
          {/* UI Mockup Card - Centered */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-gray-700/30 w-80">
            {/* Browser Controls */}
            <div className="flex gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            
            {/* Blue Progress Bar */}
            <div className="mb-4">
              <div className="h-8 bg-blue-500 rounded-lg w-24"></div>
              <div className="h-1.5 bg-gray-700 rounded-full w-32 mt-2"></div>
            </div>

            {/* Candidate List */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 bg-gray-700/20 rounded-lg">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                  alt="Candidate" 
                  className="w-9 h-9 rounded-full"
                />
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-600/60 rounded-full w-full mb-1.5"></div>
                  <div className="h-1.5 bg-gray-600/60 rounded-full w-2/3"></div>
                </div>
                <div className="text-yellow-400 text-sm">⭐</div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-700/20 rounded-lg opacity-50">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" 
                  alt="Candidate" 
                  className="w-9 h-9 rounded-full"
                />
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-600/60 rounded-full w-full mb-1.5"></div>
                  <div className="h-1.5 bg-gray-600/60 rounded-full w-2/3"></div>
                </div>
                <div className="text-gray-500 text-sm">☆</div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-700/20 rounded-lg opacity-50">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Milo" 
                  alt="Candidate" 
                  className="w-9 h-9 rounded-full"
                />
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-600/60 rounded-full w-full mb-1.5"></div>
                  <div className="h-1.5 bg-gray-600/60 rounded-full w-2/3"></div>
                </div>
                <div className="text-gray-500 text-sm">☆</div>
              </div>
            </div>
          </div>

          {/* Floating Role Badges - Positioned around the card */}
          <div className="absolute -top-20 -left-16 animate-float">
            <div className="flex items-center gap-2.5 bg-blue-600/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xl">
              <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="text-white font-medium text-sm">Product Developer</span>
            </div>
          </div>

          <div className="absolute bottom-6 -left-20 animate-float-delayed">
            <div className="flex items-center gap-2.5 bg-green-600/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xl">
              <div className="w-5 h-5 bg-green-500 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="text-white font-medium text-sm">Product Manager</span>
            </div>
          </div>

          <div className="absolute bottom-0 -right-20 animate-float">
            <div className="flex items-center gap-2.5 bg-orange-600/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xl">
              <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="text-white font-medium text-sm">Product Designer</span>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
          <h2 className="text-3xl font-light text-white mb-2">
            Find your best candidates with Marcellis
          </h2>
          <p className="text-gray-400">
            Streamline hiring and find top talent with Marcellis's tools
          </p>
          
          {/* Navigation Dots */}
          <div className="flex gap-2 justify-center mt-6">
            <div className="w-8 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Background Circle Decorations */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gray-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl"></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}