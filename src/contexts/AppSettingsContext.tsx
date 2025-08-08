import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  logo: string | null;
  systemName: string;
  primaryColor: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  logo: "/lovable-uploads/43641ce1-cadf-4331-8519-75b24de04fe1.png",
  systemName: "Pulse Marc Ellis",
  primaryColor: "#00FFFF" // Cyan color
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Apply primary color to CSS variables
  useEffect(() => {
    if (settings.primaryColor) {
      const root = document.documentElement;
      
      // Convert hex to HSL
      const hexToHsl = (hex: string) => {
        // Remove the hash if present
        hex = hex.replace('#', '');
        
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
          }
          h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
      };

      const [h, s, l] = hexToHsl(settings.primaryColor);
      
      // Update CSS variables for both light and dark themes
      root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
      root.style.setProperty('--accent', `${h} ${s}% ${l}%`);
      root.style.setProperty('--cyan', `${h} ${s}% ${l}%`);
      root.style.setProperty('--sidebar-primary', `${h} ${s}% ${l}%`);
      root.style.setProperty('--ring', `${h} ${s}% ${l}%`);
      root.style.setProperty('--sidebar-ring', `${h} ${s}% ${l}%`);
      
      // Update primary glow for dark theme
      const glowL = Math.min(l + 20, 90);
      root.style.setProperty('--primary-glow', `${h} ${s}% ${glowL}%`);
      
      // Update gradient variables
      const gradient1 = `hsl(${h} ${s}% ${l}%)`;
      const gradient2 = `hsl(${Math.max(h - 20, 0)} ${Math.max(s - 10, 0)}% ${Math.max(l - 10, 10)}%)`;
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${gradient1}, ${gradient2})`);
      
      console.log(`Primary color updated to: ${h} ${s}% ${l}%`);
    }
  }, [settings.primaryColor]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('appSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}