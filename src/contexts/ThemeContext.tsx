import { createContext, useContext, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}