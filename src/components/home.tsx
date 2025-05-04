import { useEffect } from "react";
import { ModeSelector } from "@/components/mode-selector";
import { GuiMode } from "@/components/gui-mode";
import { CliMode } from "@/components/cli-mode";
import { useMode } from "./mode-provider";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { currentMode } = useMode();

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AnimatePresence mode="wait">
      {(!currentMode || currentMode === "select") && (
        <motion.div
          key="selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ModeSelector />
        </motion.div>
      )}
      {currentMode === "gui" && (
        <motion.div
          key="gui"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GuiMode />
        </motion.div>
      )}
      {currentMode === "cli" && (
        <motion.div
          key="cli"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CliMode />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
