import { useState, useEffect } from "react";
import { ModeSelector } from "@/components/mode-selector";
import { GuiMode } from "@/components/gui-mode";
import { CliMode } from "@/components/cli-mode";
import { ModeProvider } from "@/components/mode-provider";
// import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleModeSelect = (mode: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMode(mode);
      setIsTransitioning(false);
    }, 1000); // Match this with the animation duration
  };

  return (
    // <ThemeProvider>
    <div className="dark">
      <AnimatePresence mode="wait">
        {!selectedMode ? (
          <motion.div
            key="selector"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full"
          >
            <ModeSelector
              onSelect={handleModeSelect}
              isTransitioning={isTransitioning}
            />
          </motion.div>
        ) : (
          <motion.div
            key="mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full"
          >
            <ModeProvider>
              <main className="min-h-screen w-full bg-black text-white">
                {selectedMode === "gui" ? <GuiMode /> : <CliMode />}
              </main>
            </ModeProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    // </ThemeProvider>
  );
}
