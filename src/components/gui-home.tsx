"use client";

import { useEffect } from "react";

import { ModeProvider } from "@/components/mode-provider";
// import { ThemeProvider } from "@/components/theme-provider";
import { GuiInterface } from "@/components/gui-mode";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function GuiHome() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const switchToCli = () => {
    navigate("/cli");
  };

  return (
    // <ThemeProvider>
    <div className="dark">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full"
      >
        <ModeProvider>
          <main className="min-h-screen w-full bg-black text-white">
            <GuiInterface onSwitchMode={switchToCli} />
          </main>
        </ModeProvider>
      </motion.div>
    </div>
    // </ThemeProvider>
  );
}
