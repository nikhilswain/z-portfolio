"use client";

import { ModeProvider } from "./mode-provider";
import Home from "./home";
import { SmoothCursor } from "./ui/smooth-cursor";
import { useScreenSize } from "@/lib/useScreenSize";
import type { HomepagePost } from "@/lib/blog/homepage";

export function PortfolioRoot({ posts }: { posts: HomepagePost[] }) {
  // const { isLaptopOrDesktop } = useScreenSize();
  return (
    <ModeProvider posts={posts}>
      <Home />
      {/* {isLaptopOrDesktop && <SmoothCursor />} */}
    </ModeProvider>
  );
}
