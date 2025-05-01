import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModeSelector } from "@/components/mode-selector";
// import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleModeSelect = (mode: string) => {
    // Navigate to the selected mode route
    navigate(`/${mode.toLowerCase()}`);
  };

  return (
    // <ThemeProvider>
    <div className="dark">
      <AnimatePresence mode="wait">
        <motion.div
          key="selector"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen w-full"
        >
          <ModeSelector onSelect={handleModeSelect} isTransitioning={false} />
        </motion.div>
      </AnimatePresence>
    </div>
    // </ThemeProvider>
  );
}
