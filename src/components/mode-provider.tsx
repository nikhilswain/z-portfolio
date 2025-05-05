"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import portfolioData from "@/constants/content.json";
import cliData from "@/constants/cli.json";

interface ModeContextType {
  portfolioData: any;
  cliData: any;
  currentMode: string;
  setCurrentMode: (mode: string) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<string>("select");

  // Reset mode to 'select' on page reload
  useEffect(() => {
    setCurrentMode("select");
  }, []);

  const value = {
    portfolioData,
    cliData,
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
