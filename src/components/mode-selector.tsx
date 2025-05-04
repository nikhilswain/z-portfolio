"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Monitor, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useMode } from "./mode-provider";

export function ModeSelector() {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCurrentMode } = useMode();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isTransitioning) return;

    const cards = containerRef.current.querySelectorAll(".mode-card");

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cardElement = card as HTMLElement;
      cardElement.style.setProperty("--mouse-x", `${x}px`);
      cardElement.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleCardClick = (mode: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveCard(mode);

    // Delay mode switch until card animation completes
    setTimeout(() => {
      setCurrentMode(mode);
    }, 500); // Match the duration in the transition class
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 overflow-hidden">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={!isTransitioning ? { scale: 1.03 } : {}}
          className="mode-card relative"
        >
          <Card
            className={`h-full cursor-pointer border-2 border-zinc-800 hover:border-pink-500 bg-zinc-900 text-white overflow-hidden group ${
              isTransitioning ? "pointer-events-none" : ""
            }`}
            onClick={() => handleCardClick("gui")}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),_var(--pink-500)_0%,_transparent_50%)]"></div>
            </div>

            {/* Content */}
            <motion.div
              animate={
                activeCard === "gui"
                  ? { scale: 2, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.5 }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-500">
                  <Monitor className="h-5 w-5" />
                  GUI Mode
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Experience the portfolio with a modern graphical interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-zinc-800 rounded-md flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-2 p-4 w-full">
                    <div className="h-16 bg-pink-500/20 rounded-md border border-pink-500/30"></div>
                    <div className="h-16 bg-purple-500/20 rounded-md border border-purple-500/30"></div>
                    <div className="h-16 bg-cyan-500/20 rounded-md border border-cyan-500/30"></div>
                    <div className="h-16 bg-pink-500/20 rounded-md border border-pink-500/30"></div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={!isTransitioning ? { scale: 1.03 } : {}}
          className="mode-card relative"
        >
          <Card
            className={`h-full cursor-pointer border-2 border-zinc-800 hover:border-cyan-500 bg-zinc-900 text-white overflow-hidden group ${
              isTransitioning ? "pointer-events-none" : ""
            }`}
            onClick={() => handleCardClick("cli")}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),_var(--cyan-500)_0%,_transparent_50%)]"></div>
            </div>

            {/* Content */}
            <motion.div
              animate={
                activeCard === "cli"
                  ? { scale: 2, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.5 }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-500">
                  <Terminal className="h-5 w-5" />
                  CLI Mode
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Navigate the portfolio through a command-line interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-md p-4 font-mono text-cyan-500 text-sm overflow-hidden border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span>$</span>
                    <span className="animate-pulse">_</span>
                  </div>
                  <div className="mt-2">
                    <span>$ /help</span>
                  </div>
                  <div className="mt-1">
                    <span>
                      Available commands: /about, /projects, /skills, /contact
                    </span>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
