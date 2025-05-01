"use client";

import { useState, useEffect } from "react";
import { useMode } from "@/components/mode-provider";
import { HeroSection } from "@/components/gui/hero-section";
// import { AboutSection } from "@/components/gui/about-section";
// import { SkillsSection } from "@/components/gui/skills-section";
// import { ProjectsSection } from "@/components/gui/projects-section";
// import { FunFactsSection } from "@/components/gui/fun-facts-section";
// import { ContactSection } from "@/components/gui/contact-section";
// import { Footer } from "@/components/gui/footer";
// import { useKonami } from "@/hooks/use-konami";
// import { KonamiModal } from "@/components/ui-effects/konami-modal";
// import { CursorSpotlight } from "@/components/ui-effects/cursor-spotlight";
// import { SecretCommands } from "@/components/ui-effects/secret-commands";

interface GuiInterfaceProps {
  onSwitchMode: () => void;
}

export function GuiInterface({ onSwitchMode }: GuiInterfaceProps) {
  const { portfolioData } = useMode();
  // const { konamiActivated, resetKonami } = useKonami();
  const [showKonamiModal, setShowKonamiModal] = useState(false);

  // For debugging - add a button to manually trigger the modal
  const [debugMode, setDebugMode] = useState(false);

  // Handle Konami code activation
  // useEffect(() => {
  //   if (konamiActivated) {
  //     setShowKonamiModal(true);
  //     resetKonami();
  //   }
  // }, [konamiActivated, resetKonami]);

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

  const handleCloseKonamiModal = () => {
    setShowKonamiModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection data={portfolioData} onSwitchMode={onSwitchMode} />
      {/* <AboutSection data={portfolioData.about} />
      <SkillsSection data={portfolioData.skills} />
      <ProjectsSection data={portfolioData.projects} />
      <FunFactsSection data={{ facts: portfolioData.funFacts }} />
      <ContactSection data={portfolioData.contact} />
      <Footer name={portfolioData.name} onSwitchMode={onSwitchMode} /> */}

      {/* Interactive effects */}
      {/* <CursorSpotlight />
      <SecretCommands /> */}

      {/* Debug button - only visible in debug mode */}
      {debugMode && (
        <button
          onClick={() => setShowKonamiModal(true)}
          className="fixed top-20 right-4 bg-pink-500 text-white px-4 py-2 rounded-md z-[200]"
        >
          Show Konami Modal
        </button>
      )}

      {/* Konami Code Easter Egg Modal */}
      {/* <KonamiModal isOpen={showKonamiModal} onClose={handleCloseKonamiModal} /> */}
    </div>
  );
}
