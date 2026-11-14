'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Theme = 'dark' | 'light' | 'system';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  const resolved = theme === 'system' ? getSystemTheme() : theme;

  document.documentElement.setAttribute('data-theme', resolved);
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  document.documentElement.style.colorScheme = resolved;
}

// In-memory theme state for instant broadcast across all components
let globalTheme: Theme = 'dark';
const listeners = new Set<(t: Theme) => void>();

export function setGlobalTheme(newTheme: Theme) {
  globalTheme = newTheme;
  if (typeof window !== 'undefined') {
    localStorage.setItem('orbit.theme', newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new CustomEvent('orbit-theme-change', { detail: newTheme }));
  }
  listeners.forEach((listener) => listener(newTheme));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // 1. Initial hydration from localStorage
    const stored = (localStorage.getItem('orbit.theme') as Theme | null) || 'dark';
    setThemeState(stored);
    globalTheme = stored;
    applyTheme(stored);

    // 2. Subscribe to internal listener
    const listener = (t: Theme) => setThemeState(t);
    listeners.add(listener);

    // 3. System dark mode media query changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const active = (localStorage.getItem('orbit.theme') as Theme | null) || 'dark';
      if (active === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    // 4. Custom event for multi-tab or cross-window synchronization
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
        applyTheme(customEvent.detail);
      }
    };
    window.addEventListener('orbit-theme-change', handleCustomChange);

    return () => {
      listeners.delete(listener);
      mediaQuery.removeEventListener('change', handleSystemChange);
      window.removeEventListener('orbit-theme-change', handleCustomChange);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setGlobalTheme(newTheme);
  };

  return { theme, setTheme };
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'dark', icon: Moon, label: 'Dark Mode' },
    { value: 'light', icon: Sun, label: 'Light Mode' },
    { value: 'system', icon: Monitor, label: 'System Default' },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-0.5 rounded-xl transition-colors',
        'bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm',
        className
      )}
    >
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTheme(value);
            }}
            title={label}
            aria-label={label}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center',
              isActive
                ? 'bg-accent text-white shadow-sm ring-1 ring-white/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
