"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import portfolioData from "@/constants/content.json";
import cliData from "@/constants/cli.json";
import type { HomepagePost } from "@/lib/blog/homepage";
import { MODE_STORAGE_KEY, resolveInitialMode } from "@/lib/mode-storage";

interface ModeContextType {
  portfolioData: any;
  cliData: any;
  posts: HomepagePost[];
  currentMode: string;
  setCurrentMode: (mode: string) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

function readInitialMode(): string {
  try {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return resolveInitialMode(navigation?.type, sessionStorage.getItem(MODE_STORAGE_KEY));
  } catch {
    return "select";
  }
}

export function ModeProvider({ children, posts = [] }: { children: ReactNode; posts?: HomepagePost[] }) {
  const [currentMode, setMode] = useState<string>(readInitialMode);

  const setCurrentMode = useCallback((mode: string) => {
    setMode(mode);
    try {
      sessionStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // Storage blocked: Back will return to the selector, which is the old behaviour.
    }
  }, []);

  const value = {
    portfolioData,
    cliData,
    posts,
    currentMode,
    setCurrentMode,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
