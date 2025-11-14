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
import candidate1 from '@/assets/candidate-1.jpg';
import candidate2 from '@/assets/candidate-2.jpg';
import candidate3 from '@/assets/candidate-3.jpg';
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
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseX(x);
    setMouseY(y);
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden snap-y snap-mandatory lg:snap-none overflow-y-auto">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative overflow-hidden min-h-screen shrink-0 snap-start lg:snap-align-none" style={{ backgroundColor: '#1a1d23' }}>
        <MissionBackground className="absolute inset-0" />
        
        
        <div className="w-full max-w-md relative z-10 px-2 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground text-center mb-2">Welcome back!</h1>
            <p className="text-center text-muted-foreground text-sm sm:text-base">
              Log in now and save time on employee administration.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 border-border/50 backdrop-blur-sm h-12 sm:h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm sm:text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50 border-border/50 backdrop-blur-sm h-12 sm:h-11 text-base"
              />
              <div className="flex justify-end pt-1">
                <button type="button" className="text-sm sm:text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
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
              className="w-full h-14 sm:h-12 rounded-full font-medium text-black transition-all duration-200 text-base"
              style={{ backgroundColor: '#00d9ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00b8d4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00d9ff'}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />}
              {isLogin ? 'Sign in' : 'Sign Up'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Visual Content */}
      <div 
        className="w-full lg:w-1/2 flex relative overflow-hidden items-center justify-center p-4 md:p-8 pt-16 md:pt-8 min-h-screen shrink-0 snap-start lg:snap-align-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Animated Background Pattern */}
        <div 
          className="absolute inset-0 animate-rotate-pattern"
          style={{
            backgroundColor: '#1a1d23',
            backgroundImage: 'url(/auth-bg-pattern.png)',
            backgroundSize: '400px 400px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
          }}
        ></div>
        
        {/* Subtle overlay to control pattern visibility */}
        <div className="absolute inset-0 bg-black/20" style={{ mixBlendMode: 'overlay' }}></div>
        {/* Subtle Geometric Background Patterns with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-10 w-64 h-64 bg-gray-800/10 rounded-3xl rotate-12 blur-xl transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)` }}
          ></div>
          <div 
            className="absolute bottom-32 right-16 w-80 h-80 bg-gray-700/10 rounded-3xl -rotate-12 blur-2xl transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mouseX * -40}px, ${mouseY * -40}px)` }}
          ></div>
          <div 
            className="absolute top-1/3 right-1/4 w-48 h-48 bg-gray-800/10 rounded-3xl rotate-45 blur-xl transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gray-700/10 rounded-3xl -rotate-45 blur-2xl transition-transform duration-300 ease-out"
            style={{ transform: `translate(${mouseX * -25}px, ${mouseY * -25}px)` }}
          ></div>
        </div>

        {/* Slide 0 - Candidate Management */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${activeSlide === 0 ? 'opacity-100 translate-x-0 scale-100 blur-0 animate-fade-in' : activeSlide > 0 ? 'opacity-0 -translate-x-full scale-95 blur-sm pointer-events-none' : 'opacity-0 translate-x-full scale-95 blur-sm pointer-events-none'}`}>
          <div className="relative">
            {/* UI Mockup Card - Centered */}
            <div className={`bg-gray-900/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-gray-800/40 w-64 sm:w-72 animate-pulse-glow transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer ${activeSlide === 0 ? 'animate-scale-in' : ''}`}>
              {/* Browser Controls */}
              <div className="flex gap-1.5 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Header */}
              <div className="mb-2 sm:mb-3">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <h3 className="text-white font-semibold text-xs sm:text-sm">Top Candidates</h3>
                  <span className="text-blue-400 text-[10px] sm:text-xs">View All</span>
                </div>
                <div className="h-1 bg-gray-700/50 rounded-full w-full">
                  <div className="h-1 bg-blue-500/90 rounded-full w-3/4 shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                </div>
              </div>

              {/* Candidate List */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-800/40 rounded-lg border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                  <img 
                    src={candidate1} 
                    alt="Sarah Johnson" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-blue-500/30 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm font-medium truncate">Sarah Johnson</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs truncate">Product Designer</p>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className="text-yellow-400 text-xs sm:text-sm">⭐</span>
                    <span className="text-gray-300 text-[10px] sm:text-xs font-medium">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/20">
                  <img 
                    src={candidate2} 
                    alt="Michael Chen" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-1 ring-gray-700/40 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm font-medium truncate">Michael Chen</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs truncate">Senior Developer</p>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm">☆</span>
                    <span className="text-gray-400 text-[10px] sm:text-xs">4.2</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/20">
                  <img 
                    src={candidate3} 
                    alt="Emma Martinez" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-1 ring-gray-700/40 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm font-medium truncate">Emma Martinez</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs truncate">Product Manager</p>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm">☆</span>
                    <span className="text-gray-400 text-[10px] sm:text-xs">3.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Role Badges with Neon Glow - Positioned around the card */}
            <div className="absolute -top-12 sm:-top-16 -left-16 sm:-left-20 animate-float">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-600/90 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] border border-blue-500/30">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm">Product Developer</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-16 sm:-left-24 animate-float-delayed">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-green-600/90 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.6)] border border-green-500/30">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm">Product Manager</span>
              </div>
            </div>

            <div className="absolute top-1/2 -right-16 sm:-right-24 animate-float hidden sm:flex">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-orange-600/90 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.6)] border border-orange-500/30">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.8)]">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm">Product Designer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 1 - Analytics Dashboard */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${activeSlide === 1 ? 'opacity-100 translate-x-0 scale-100 blur-0 animate-fade-in' : activeSlide > 1 ? 'opacity-0 -translate-x-full scale-95 blur-sm pointer-events-none' : 'opacity-0 translate-x-full scale-95 blur-sm pointer-events-none'}`}>
          <div className="relative">
            <div className={`bg-gray-900/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-gray-800/40 w-64 sm:w-72 animate-pulse-glow transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer ${activeSlide === 1 ? 'animate-scale-in' : ''}`}>
              <div className="flex gap-1.5 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Header */}
              <div className="mb-2 sm:mb-3">
                <h3 className="text-white font-semibold text-xs sm:text-sm mb-1">Performance Analytics</h3>
                <p className="text-gray-400 text-[10px] sm:text-xs">Last 7 days</p>
              </div>

              {/* Analytics Chart */}
              <div className="space-y-3">
                <div className="flex items-end gap-1.5 h-20 bg-gray-800/20 rounded-lg p-2">
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-12 relative group">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">48</span>
                  </div>
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-16 relative group">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">62</span>
                  </div>
                  <div className="flex-1 bg-purple-500/90 rounded-t-lg h-20 shadow-[0_0_15px_rgba(168,85,247,0.5)] relative group">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">85</span>
                  </div>
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-14 relative group">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">56</span>
                  </div>
                  <div className="flex-1 bg-purple-500/70 rounded-t-lg h-10 relative group">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">38</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/20">
                    <div>
                      <p className="text-white text-xs font-medium">Active Applications</p>
                      <p className="text-gray-400 text-[10px]">This week</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400 text-xs">↑</span>
                      <span className="text-green-400 text-sm font-semibold">23%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-gray-800/20 rounded-lg border border-gray-700/10">
                    <div>
                      <p className="text-white text-xs font-medium">Interviews Scheduled</p>
                      <p className="text-gray-400 text-[10px]">This week</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-400 text-xs">↓</span>
                      <span className="text-gray-400 text-sm font-semibold">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-12 sm:-top-12 -left-12 sm:-left-16 animate-float">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-600/90 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.6)] border border-purple-500/30">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm">Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 - Interview Scheduling */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${activeSlide === 2 ? 'opacity-100 translate-x-0 scale-100 blur-0 animate-fade-in' : activeSlide > 2 ? 'opacity-0 -translate-x-full scale-95 blur-sm pointer-events-none' : 'opacity-0 translate-x-full scale-95 blur-sm pointer-events-none'}`}>
          <div className="relative">
            <div className={`bg-gray-900/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-gray-800/40 w-64 sm:w-72 animate-pulse-glow transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer ${activeSlide === 2 ? 'animate-scale-in' : ''}`}>
              <div className="flex gap-1.5 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Header */}
              <div className="mb-2 sm:mb-3">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <h3 className="text-white font-semibold text-xs sm:text-sm">Interview Schedule</h3>
                  <span className="text-cyan-400 text-[10px] sm:text-xs">December 2024</span>
                </div>
              </div>

              {/* Calendar Interface */}
              <div className="space-y-2">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-gray-500 text-[10px] text-center font-medium">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(35)].map((_, i) => {
                    const dayNum = i - 2;
                    const isToday = dayNum === 15;
                    const hasInterview = [5, 9, 18, 22].includes(dayNum);
                    return (
                      <div 
                        key={i}
                        className={`aspect-square rounded text-[10px] flex items-center justify-center ${
                          dayNum < 1 || dayNum > 31 ? 'text-gray-700' :
                          isToday ? 'bg-cyan-500/80 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 
                          hasInterview ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 
                          'text-gray-400 hover:bg-gray-800/30'
                        }`}
                      >
                        {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                      </div>
                    );
                  })}
                </div>
                
                {/* Upcoming Interviews */}
                <div className="space-y-1.5 mt-2 sm:mt-3">
                  <p className="text-white text-[10px] sm:text-xs font-medium mb-1">Upcoming</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <div className="w-0.5 sm:w-1 h-8 sm:h-10 bg-cyan-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[10px] sm:text-xs font-medium truncate">Sarah Johnson</p>
                      <p className="text-gray-400 text-[9px] sm:text-[10px]">Today • 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-800/20 rounded-lg border border-gray-700/20">
                    <div className="w-0.5 sm:w-1 h-8 sm:h-10 bg-gray-600 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[10px] sm:text-xs font-medium truncate">Michael Chen</p>
                      <p className="text-gray-400 text-[9px] sm:text-[10px]">Dec 18 • 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-12 sm:-top-16 -right-16 sm:-right-20 animate-float hidden sm:flex">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-cyan-600/90 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-500/30">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm">Smart Scheduling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 3 - AI Insights */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${activeSlide === 3 ? 'opacity-100 translate-x-0 scale-100 blur-0 animate-fade-in' : activeSlide > 3 ? 'opacity-0 -translate-x-full scale-95 blur-sm pointer-events-none' : 'opacity-0 translate-x-full scale-95 blur-sm pointer-events-none'}`}>
          <div className="relative">
            <div className={`bg-gray-900/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-gray-800/40 w-64 sm:w-72 animate-pulse-glow transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer ${activeSlide === 3 ? 'animate-scale-in' : ''}`}>
              <div className="flex gap-1.5 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500/80"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Header */}
              <div className="mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center">
                    <span className="text-white text-[10px] sm:text-xs font-bold">AI</span>
                  </div>
                  <h3 className="text-white font-semibold text-xs sm:text-sm">Smart Recommendations</h3>
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-500/40">
                  <div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <span className="text-pink-400 text-xs sm:text-sm">⚡</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Perfect Match Found</p>
                      <p className="text-gray-300 text-[9px] sm:text-[10px] leading-relaxed">
                        Sarah Johnson's skills align 95% with the Product Designer role requirements.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1.5 sm:mt-2">
                    <span className="text-[8px] sm:text-[9px] bg-pink-500/20 text-pink-300 px-1.5 sm:px-2 py-0.5 rounded-full">Figma Expert</span>
                    <span className="text-[8px] sm:text-[9px] bg-purple-500/20 text-purple-300 px-1.5 sm:px-2 py-0.5 rounded-full">5+ years</span>
                  </div>
                </div>
                
                <div className="p-2 sm:p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/20">
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-blue-400 text-xs sm:text-sm">💡</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Interview Tip</p>
                      <p className="text-gray-400 text-[9px] sm:text-[10px]">
                        Ask about their mobile app design experience.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 sm:p-2.5 bg-gray-800/20 rounded-lg border border-gray-700/10">
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-green-400 text-xs sm:text-sm">📊</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Market Insight</p>
                      <p className="text-gray-400 text-[9px] sm:text-[10px]">
                        Similar roles offer 15% higher salary range.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 sm:-bottom-8 -left-16 sm:-left-20 animate-float-delayed">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-pink-600 to-purple-600 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] border border-pink-500/30">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-sm"></div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm">AI-Powered Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text - Dynamic based on slide */}
        <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 text-center max-w-sm sm:max-w-md z-10 px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-white mb-1 sm:mb-2 transition-opacity duration-500">
            {activeSlide === 0 && "Find your best candidates with Marc Ellis"}
            {activeSlide === 1 && "Track performance with real-time analytics"}
            {activeSlide === 2 && "Schedule interviews effortlessly"}
            {activeSlide === 3 && "Get AI-powered hiring recommendations"}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm transition-opacity duration-500">
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
        @keyframes rotate-pattern {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 20px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
          }
          50% { 
            box-shadow: 0 25px 80px -10px rgba(0,0,0,0.9), 0 0 30px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.2);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-rotate-pattern {
          animation: rotate-pattern 120s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 120s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .animate-pulse-glow::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
          animation-delay: 1s;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}