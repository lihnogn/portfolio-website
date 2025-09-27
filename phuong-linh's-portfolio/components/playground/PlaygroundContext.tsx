import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type PlaygroundTheme = 'Pastel' | 'Dark' | 'Neon' | 'Magical';
export type InteractionMode = 'Calm' | 'Playful' | 'Chaotic';

type PlaygroundSettings = {
  theme: PlaygroundTheme;
  setTheme: (t: PlaygroundTheme) => void;
  mode: InteractionMode;
  setMode: (m: InteractionMode) => void;
};

const PlaygroundContext = createContext<PlaygroundSettings | undefined>(undefined);

const DEFAULTS: { theme: PlaygroundTheme; mode: InteractionMode } = {
  theme: 'Pastel',
  mode: 'Calm',
};

const STORAGE_KEY = 'playground_settings_v1';

export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<PlaygroundTheme>(DEFAULTS.theme);
  const [mode, setMode] = useState<InteractionMode>(DEFAULTS.mode);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { theme: PlaygroundTheme; mode: InteractionMode };
        if (parsed?.theme) setTheme(parsed.theme);
        if (parsed?.mode) setMode(parsed.mode);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, mode }));
    } catch {}
  }, [theme, mode]);

  const value = useMemo(() => ({ theme, setTheme, mode, setMode }), [theme, mode]);
  return <PlaygroundContext.Provider value={value}>{children}</PlaygroundContext.Provider>;
};

export const usePlaygroundSettings = () => {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlaygroundSettings must be used within PlaygroundProvider');
  return ctx;
};
