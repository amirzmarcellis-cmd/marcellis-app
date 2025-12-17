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
import slideProblems from '@/assets/slide-problems.png';
import slideAddJob from '@/assets/slide-add-job.png';
import slideLinkedIn from '@/assets/slide-linkedin.png';
import slideShortlist from '@/assets/slide-shortlist.png';
import slideCallLog from '@/assets/slide-call-log.png';
import { savePushToken } from '@/lib/pushToken';

export default function Auth() {
  const { settings } = useAppSettings();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
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
    // Small delay to ensure sign-out has fully processed
    const timer = setTimeout(async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Auto-rotate slides every 2 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 5);
    }, 2000);
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
      setActiveSlide(prev => (prev + 1) % 5);
    }
    if (isRightSwipe) {
      setActiveSlide(prev => (prev - 1 + 5) % 5);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseX(x);
    setMouseY(y);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
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
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        // Save push token for mobile users after login
        if (data.session?.user?.id) {
          savePushToken(data.session.user.id, email);
        }
      } else {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;

        // Save push token for mobile users after signup
        if (data.session?.user?.id) {
          savePushToken(data.session.user.id, email);
        }
      }
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const slideImages = [
    { src: slideProblems, alt: 'Problems We Solve' },
    { src: slideAddJob, alt: 'Adding a Job' },
    { src: slideLinkedIn, alt: 'LinkedIn Outreach' },
    { src: slideShortlist, alt: 'AI Shortlist' },
    { src: slideCallLog, alt: 'Call Log & Analysis' },
  ];

  const slideTexts = [
    { title: 'Problems We Solve', subtitle: 'Recruitment challenges we address with AI' },
    { title: 'Powerful Job Configuration', subtitle: 'Set up jobs with detailed requirements and criteria' },
    { title: 'Automated LinkedIn Outreach', subtitle: 'Headhunt top talent directly from LinkedIn' },
    { title: 'AI-Powered Shortlisting', subtitle: 'Top candidates surface automatically' },
    { title: 'Call Log & Analysis', subtitle: 'AI-powered candidate screening and insights' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden snap-y snap-mandatory lg:snap-none overflow-y-auto">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative overflow-hidden min-h-screen shrink-0 snap-start lg:snap-align-none" style={{
        backgroundColor: '#1a1d23'
      }}>
        <MissionBackground className="absolute inset-0" />
        
        <div className="w-full max-w-md relative z-10 px-2 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                <img src={theme === 'dark' ? settings.logoLight || settings.logo || defaultLogo : settings.logoDark || settings.logo || defaultLogo} alt="Company Logo" className="w-full h-full object-contain" fetchPriority="high" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground text-center mb-2">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h1>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm sm:text-base">Email</Label>
              <Input id="email" type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-input/50 border-border/50 backdrop-blur-sm h-12 sm:h-11 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm sm:text-base">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-input/50 border-border/50 backdrop-blur-sm h-12 sm:h-11 text-base" />
              {isLogin && (
                <div className="flex justify-end pt-1">
                  <button type="button" className="text-sm sm:text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                    Forgot password
                  </button>
                </div>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button id="sign-in-btn" type="submit" className="w-full h-14 sm:h-12 rounded-full font-medium text-black transition-all duration-200 text-base" style={{
              backgroundColor: '#00d9ff'
            }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00b8d4'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d9ff'} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />}
              {isLogin ? 'Sign in' : 'Sign Up'}
            </Button>
            
            <div className="text-center pt-2">
              <button type="button" onClick={toggleMode} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-medium" style={{
                  color: '#00d9ff'
                }}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Visual Content */}
      <div className="w-full lg:w-1/2 flex relative overflow-hidden items-center justify-center p-4 md:p-8 pt-16 md:pt-8 min-h-screen shrink-0 snap-start lg:snap-align-none" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onMouseMove={handleMouseMove} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 animate-rotate-pattern" style={{
          backgroundColor: '#1a1d23',
          backgroundImage: 'url(/auth-bg-pattern.png)',
          backgroundSize: '400px 400px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat'
        }}></div>
        
        {/* Subtle overlay to control pattern visibility */}
        <div className="absolute inset-0 bg-black/20" style={{
          mixBlendMode: 'overlay'
        }}></div>

        {/* Subtle Geometric Background Patterns with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gray-800/10 rounded-3xl rotate-12 blur-xl transition-transform duration-300 ease-out" style={{
            transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)`
          }}></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-gray-700/10 rounded-3xl -rotate-12 blur-2xl transition-transform duration-300 ease-out" style={{
            transform: `translate(${mouseX * -40}px, ${mouseY * -40}px)`
          }}></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gray-800/10 rounded-3xl rotate-45 blur-xl transition-transform duration-300 ease-out" style={{
            transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)`
          }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gray-700/10 rounded-3xl -rotate-45 blur-2xl transition-transform duration-300 ease-out" style={{
            transform: `translate(${mouseX * -25}px, ${mouseY * -25}px)`
          }}></div>
        </div>

        {/* Slides */}
        {slideImages.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
              activeSlide === index 
                ? 'opacity-100 translate-x-0 scale-100 blur-0 animate-fade-in' 
                : activeSlide > index 
                  ? 'opacity-0 -translate-x-full scale-95 blur-sm pointer-events-none' 
                  : 'opacity-0 translate-x-full scale-95 blur-sm pointer-events-none'
            }`}
          >
            <img 
              src={slide.src} 
              alt={slide.alt} 
              className="max-w-[85%] max-h-[70vh] object-contain rounded-2xl shadow-2xl transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_25px_60px_-15px_rgba(0,217,255,0.3)] hover:brightness-105 cursor-pointer"
            />
          </div>
        ))}

        {/* Bottom Text - Dynamic based on slide */}
        <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 text-center max-w-sm sm:max-w-md z-10 px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-white mb-1 sm:mb-2 transition-opacity duration-500">
            {slideTexts[activeSlide]?.title}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm transition-opacity duration-500">
            {slideTexts[activeSlide]?.subtitle}
          </p>
          
          {/* Navigation Dots */}
          <div className="flex gap-2 justify-center mt-6">
            {[0, 1, 2, 3, 4].map(index => (
              <button 
                key={index} 
                onClick={() => setActiveSlide(index)} 
                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-8 bg-white' : 'w-2 bg-gray-600 hover:bg-gray-500'}`} 
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
