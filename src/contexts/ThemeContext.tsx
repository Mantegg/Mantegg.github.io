import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig } from '@/types/gamebook';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  toggleMode: () => void;
  backgroundGradient: string | null;
  setBackgroundGradient: (gradient: string | null) => void;
  defaultGradient: string | null;
  setDefaultGradient: (gradient: string | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'gamebook_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [backgroundGradient, setBackgroundGradient] = useState<string | null>(null);
  const [defaultGradient, setDefaultGradient] = useState<string | null>(null);

  const setMode = (newMode: 'light' | 'dark') => {
    setModeState(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  // Apply dark class to document
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        backgroundGradient,
        setBackgroundGradient,
        defaultGradient,
        setDefaultGradient,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useApplyThemeConfig(config?: ThemeConfig) {
  const { setMode, setDefaultGradient, setBackgroundGradient } = useTheme();

  useEffect(() => {
    if (config?.defaultMode) {
      // Only apply default mode if user hasn't overridden
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) {
        setMode(config.defaultMode);
      }
    }
    if (config?.backgroundGradient) {
      setDefaultGradient(config.backgroundGradient);
      setBackgroundGradient(config.backgroundGradient);
    }
  }, [config, setMode, setDefaultGradient, setBackgroundGradient]);
}
