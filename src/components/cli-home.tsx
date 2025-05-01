import { ModeProvider } from "@/components/mode-provider";
// import { ThemeProvider } from "@/components/theme-provider";
import { CliMode } from "@/components/cli-mode";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function CliHome() {
  const navigate = useNavigate();

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Function to switch to GUI mode
  const switchToGui = () => {
    navigate("/gui");
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
            <CliMode onSwitchMode={switchToGui} />
          </main>
        </ModeProvider>
      </motion.div>
    </div>
    // </ThemeProvider>
  );
}
