import { useState, useEffect } from "react";
import { useMode } from "@/components/mode-provider";
import { HeroSection } from "@/components/gui/hero-section";
import { AboutSection } from "@/components/gui/about-section";
import { SkillsSection } from "@/components/gui/skills-section";
import { ProjectsSection } from "@/components/gui/project-section";
import { ContactSection } from "@/components/gui/contact-section";

export function GuiMode() {
  const { portfolioData, setCurrentMode } = useMode();
  const [debugMode, setDebugMode] = useState(false);

  const handleSwitchMode = () => {
    setCurrentMode("cli");
  };

  // Enable debug mode with key combination (Ctrl+Alt+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.code === "KeyD") {
        setDebugMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection data={portfolioData} onSwitchMode={handleSwitchMode} />
      <AboutSection data={portfolioData?.about} />
      <SkillsSection data={portfolioData?.skills} />
      <ProjectsSection data={portfolioData?.projects} />
      <ContactSection data={portfolioData?.contact} />
    </div>
  );
}
