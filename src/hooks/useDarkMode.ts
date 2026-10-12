import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'tabungan_santri_theme';

export function useDarkMode() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode: ThemeMode) => {
      let resolvedDark = false;
      if (mode === 'dark') {
        resolvedDark = true;
      } else if (mode === 'light') {
        resolvedDark = false;
      } else {
        resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(resolvedDark);
      if (resolvedDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Update meta theme-color for mobile status bar
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolvedDark ? '#0F172A' : '#0F766E');
      }
    };

    applyTheme(theme);

    // If 'system', listen for OS changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener?.('change', handleSystemChange);
    return () => {
      mediaQuery.removeEventListener?.('change', handleSystemChange);
    };
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const toggleDark = () => {
    if (isDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleDark,
  };
}
