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
  const [activeSlide, setActiveSlide] = useState(0);
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-950 to-gray-900 relative overflow-hidden items-center justify-center p-12">
        {/* Subtle Geometric Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gray-800/10 rounded-3xl rotate-12 blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-gray-700/10 rounded-3xl -rotate-12 blur-2xl"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gray-800/10 rounded-3xl rotate-45 blur-xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gray-700/10 rounded-3xl -rotate-45 blur-2xl"></div>
        </div>

        {/* Central Content Container */}
        <div className="relative z-10">
          {/* UI Mockup Card - Centered */}
          <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-gray-800/40 w-72">
            {/* Browser Controls */}
            <div className="flex gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
            </div>
            
            {/* Blue Progress Bar */}
            <div className="mb-3">
              <div className="h-6 bg-blue-500/90 rounded-lg w-20 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <div className="h-1 bg-gray-700/50 rounded-full w-28 mt-2"></div>
            </div>

            {/* Candidate List */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 p-2 bg-gray-800/30 rounded-lg border border-gray-700/20">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                  alt="Candidate" 
                  className="w-8 h-8 rounded-full ring-1 ring-gray-700/50"
                />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-600/50 rounded-full w-full"></div>
                  <div className="h-1.5 bg-gray-600/50 rounded-full w-2/3"></div>
                </div>
                <div className="text-yellow-400 text-xs">⭐</div>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-gray-800/20 rounded-lg border border-gray-700/10 opacity-60">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" 
                  alt="Candidate" 
                  className="w-8 h-8 rounded-full ring-1 ring-gray-700/30"
                />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-600/40 rounded-full w-full"></div>
                  <div className="h-1.5 bg-gray-600/40 rounded-full w-2/3"></div>
                </div>
                <div className="text-gray-600 text-xs">☆</div>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-gray-800/20 rounded-lg border border-gray-700/10 opacity-60">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Milo" 
                  alt="Candidate" 
                  className="w-8 h-8 rounded-full ring-1 ring-gray-700/30"
                />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-600/40 rounded-full w-full"></div>
                  <div className="h-1.5 bg-gray-600/40 rounded-full w-2/3"></div>
                </div>
                <div className="text-gray-600 text-xs">☆</div>
              </div>
            </div>
          </div>

          {/* Floating Role Badges with Neon Glow - Positioned around the card */}
          <div className="absolute -top-16 -left-20 animate-float">
            <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] border border-blue-500/30">
              <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
              </div>
              <span className="text-white font-medium text-sm">Product Developer</span>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-24 animate-float-delayed">
            <div className="flex items-center gap-2 bg-green-600/90 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.6)] border border-green-500/30">
              <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
              </div>
              <span className="text-white font-medium text-sm">Product Manager</span>
            </div>
          </div>

          <div className="absolute top-1/2 -right-24 animate-float">
            <div className="flex items-center gap-2 bg-orange-600/90 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.6)] border border-orange-500/30">
              <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.8)]">
                <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
              </div>
              <span className="text-white font-medium text-sm">Product Designer</span>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center max-w-md z-10">
          <h2 className="text-3xl font-light text-white mb-2">
            Find your best candidates with Marc Ellis
          </h2>
          <p className="text-gray-400 text-sm">
            Streamline hiring and find top talent with Marc Ellis's tools
          </p>
          
          {/* Navigation Dots */}
          <div className="flex gap-2 justify-center mt-6">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === index ? 'w-8 bg-white' : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
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