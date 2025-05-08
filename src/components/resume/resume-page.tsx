import { motion } from "framer-motion";
import { ModeProvider } from "@/components/mode-provider";
import { ResumeView } from "@/components/resume/resume-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ResumePage() {
  return (
    <div className="dark">
      <ModeProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-black text-white"
        >
          <header className="fixed top-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-md z-50 border-b border-zinc-800"></header>

          <main className="pt-16 pb-20">
            <ResumeView />
          </main>
        </motion.div>
      </ModeProvider>
    </div>
  );
}
