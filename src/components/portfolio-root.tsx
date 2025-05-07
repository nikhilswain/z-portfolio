"use client";

import { ModeProvider } from "./mode-provider";
import Home from "./home";
import { SmoothCursor } from "./ui/smooth-cursor";
import { useScreenSize } from "@/lib/useScreenSize";

export function PortfolioRoot() {
  // const { isLaptopOrDesktop } = useScreenSize();
  return (
    <ModeProvider>
      <Home />
      {/* {isLaptopOrDesktop && <SmoothCursor />} */}
    </ModeProvider>
  );
}
