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
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left - go to next slide
      setActiveSlide((prev) => (prev + 1) % 4);
    }
    if (isRightSwipe) {
      // Swipe right - go to previous slide
      setActiveSlide((prev) => (prev - 1 + 4) % 4);
    }
  };

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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden" style={{ backgroundColor: '#1a1d23' }}>
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
              className="w-full h-12 rounded-full font-medium text-black"
              style={{ backgroundColor: '#00d9ff' }}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign in' : 'Sign Up'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Visual Content */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{
          backgroundColor: '#1a1d23',
          backgroundImage: 'url(/auth-pattern.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'soft-light',
          opacity: 0.95
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Dark overlay to control pattern visibility */}
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Subtle Geometric Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gray-800/10 rounded-3xl rotate-12 blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-gray-700/10 rounded-3xl -rotate-12 blur-2xl"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gray-800/10 rounded-3xl rotate-45 blur-xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gray-700/10 rounded-3xl -rotate-45 blur-2xl"></div>
        </div>

        {/* Slide 0 - Candidate Management */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative">
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
        </div>

        {/* Slide 1 - Analytics Dashboard */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-gray-800/40 w-72">
              <div className="flex gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Analytics Chart */}
              <div className="space-y-3">
                <div className="flex items-end gap-1.5 h-20">
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-12"></div>
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-16"></div>
                  <div className="flex-1 bg-purple-500/90 rounded-t-lg h-20 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-14"></div>
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-10"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                    <div className="h-1.5 bg-gray-600/50 rounded-full w-20"></div>
                    <div className="text-green-400 text-xs">↑ 23%</div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/20 rounded-lg opacity-60">
                    <div className="h-1.5 bg-gray-600/40 rounded-full w-16"></div>
                    <div className="text-gray-500 text-xs">↓ 5%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-12 -left-16 animate-float">
              <div className="flex items-center gap-2 bg-purple-600/90 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.6)] border border-purple-500/30">
                <div className="w-5 h-5 bg-purple-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-sm">Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 - Interview Scheduling */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeSlide === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-gray-800/40 w-72">
              <div className="flex gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Calendar Interface */}
              <div className="space-y-2">
                <div className="h-5 bg-cyan-500/90 rounded-lg w-24 shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-3"></div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i}
                      className={`aspect-square rounded ${
                        i === 5 ? 'bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 
                        i === 9 ? 'bg-cyan-500/50' : 
                        'bg-gray-800/30'
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg">
                    <div className="w-1 h-8 bg-cyan-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 bg-gray-600/50 rounded-full w-full"></div>
                      <div className="h-1 bg-gray-600/40 rounded-full w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-16 -right-20 animate-float">
              <div className="flex items-center gap-2 bg-cyan-600/90 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-500/30">
                <div className="w-5 h-5 bg-cyan-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-sm">Smart Scheduling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 3 - AI Insights */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${activeSlide === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-gray-800/40 w-72">
              <div className="flex gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* AI Insights */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                  <div className="h-2 bg-pink-500/70 rounded-full w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-500/30">
                    <div className="h-1.5 bg-gray-300/70 rounded-full w-full mb-1"></div>
                    <div className="h-1.5 bg-gray-300/70 rounded-full w-4/5"></div>
                  </div>
                  <div className="p-2 bg-gray-800/30 rounded-lg opacity-70">
                    <div className="h-1.5 bg-gray-600/50 rounded-full w-full mb-1"></div>
                    <div className="h-1.5 bg-gray-600/50 rounded-full w-3/5"></div>
                  </div>
                  <div className="p-2 bg-gray-800/20 rounded-lg opacity-60">
                    <div className="h-1.5 bg-gray-600/40 rounded-full w-full mb-1"></div>
                    <div className="h-1.5 bg-gray-600/40 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-20 animate-float-delayed">
              <div className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] border border-pink-500/30">
                <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-sm">AI-Powered Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text - Dynamic based on slide */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center max-w-md z-10">
          <h2 className="text-3xl font-light text-white mb-2 transition-opacity duration-500">
            {activeSlide === 0 && "Find your best candidates with Marc Ellis"}
            {activeSlide === 1 && "Track performance with real-time analytics"}
            {activeSlide === 2 && "Schedule interviews effortlessly"}
            {activeSlide === 3 && "Get AI-powered hiring recommendations"}
          </h2>
          <p className="text-gray-400 text-sm transition-opacity duration-500">
            {activeSlide === 0 && "Streamline hiring and find top talent with Marc Ellis's tools"}
            {activeSlide === 1 && "Monitor your recruitment metrics and make data-driven decisions"}
            {activeSlide === 2 && "Coordinate interviews with candidates and team members seamlessly"}
            {activeSlide === 3 && "Leverage AI to identify the perfect candidates faster"}
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