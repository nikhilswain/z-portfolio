'use client';

import { ModeProvider } from "./mode-provider";
import Home from "./home";
import { SmoothCursor } from "./ui/smooth-cursor";

export function PortfolioRoot() {
  return (
    <ModeProvider>
      <Home />
      <SmoothCursor />
    </ModeProvider>
  );
}
