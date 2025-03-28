import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useMode } from "@/components/mode-provider";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  ChevronDown,
  ExternalLink,
  Github,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Code,
  Coffee,
  Music,
  Gamepad,
  Heart,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function GuiMode() {
  const { portfolioData, setCurrentMode } = useMode();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showKonamiCode, setShowKonamiCode] = useState(false);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [skillViewMode, setSkillViewMode] = useState<"grid" | "orbital">(
    "orbital"
  );
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isModalBouncing, setIsModalBouncing] = useState(false);

  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.9]);

  // 3D tilt effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  // Parallax effect for hero section
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);

  // Smooth spring physics for better parallax
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const smoothY = useSpring(heroY, springConfig);

  // Reference to the viewport
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...konamiSequence, e.key];
      if (newSequence.length > konamiCode.length) {
        newSequence.shift();
      }
      setKonamiSequence(newSequence);

      // Check if the sequence matches the Konami code
      if (
        newSequence.length === konamiCode.length &&
        newSequence.every((key, i) => key === konamiCode[i])
      ) {
        // Start the bouncing animation
        startBouncingAnimation();
      }

      // Close modal with ESC key
      if (e.key === "Escape" && showKonamiCode) {
        setShowKonamiCode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiSequence, showKonamiCode]);

  // Function to start the bouncing animation
  const startBouncingAnimation = () => {
    if (viewportRef.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Start with a small element at a random position
      setModalPosition({
        x: Math.random() * (viewportWidth - 100),
        y: Math.random() * (viewportHeight - 100),
      });

      setIsModalBouncing(true);

      // Animate the bouncing effect
      let bounceCount = 0;
      const maxBounces = 5;
      const bounceInterval = setInterval(() => {
        setModalPosition({
          x: Math.random() * (viewportWidth - 100),
          y: Math.random() * (viewportHeight - 100),
        });

        bounceCount++;
        if (bounceCount >= maxBounces) {
          clearInterval(bounceInterval);
          setIsModalBouncing(false);
          setShowKonamiCode(true);
        }
      }, 300);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Message sent! (This is a demo)");
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleLogoClick = () => {
    setEasterEggCount((prev) => prev + 1);
    if (easterEggCount >= 4) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 3000);
      setEasterEggCount(0);
    }
  };

  const featuredProjects = portfolioData.projects.filter(
    (project: any) => project.featured
  );
  const regularProjects = portfolioData.projects.filter(
    (project: any) => !project.featured
  );

  const contactItems = [
    { icon: Mail, label: "Email", value: portfolioData.contact.email },
    { icon: Phone, label: "Phone", value: portfolioData.contact.phone },
    { icon: MapPin, label: "Location", value: portfolioData.contact.location },
    { icon: Github, label: "GitHub", value: portfolioData.contact.github },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: portfolioData.contact.linkedin,
    },
    { icon: Twitter, label: "Twitter", value: portfolioData.contact.twitter },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-black text-white" ref={viewportRef}>
      {/* Easter Egg */}
      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-pink-500 text-white px-4 py-2 rounded-md shadow-lg"
        >
          🎉 You found an easter egg! 🎉
        </motion.div>
      )}

      {/* Bouncing Modal Animation */}
      {isModalBouncing && (
        <motion.div
          className="fixed z-50 w-16 h-16 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
            boxShadow: "0 0 20px rgba(255, 0, 128, 0.5)",
          }}
          animate={{ scale: [0.5, 1.2, 0.8] }}
          transition={{
            duration: 0.3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          GAME MODE
        </motion.div>
      )}

      {/* Konami Code Easter Egg */}
      {showKonamiCode && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative w-full max-w-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border-4 border-pink-500/50 p-8 overflow-hidden"
          >
            {/* Comic-style elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full translate-y-32 -translate-x-32"></div>

            {/* Comic-style corner */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500 -translate-x-12 -translate-y-12 rotate-45"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500 translate-x-12 -translate-y-12 rotate-45"></div>

            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors duration-300"
              onClick={() => setShowKonamiCode(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>

            <div className="relative z-10">
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <h2 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                  🎮 GAMER MODE ACTIVATED! 🎮
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 text-center"
              >
                <p className="text-xl text-zinc-300">
                  I'm a passionate gamer too! Let's connect and play together.
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  Press ESC or click the X to close
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const mouseY = e.clientY - rect.top;

                  // Update all icons with parallax effect
                  const icons = document.querySelectorAll(".game-icon");
                  icons.forEach((icon) => {
                    const iconRect = (
                      icon as HTMLElement
                    ).getBoundingClientRect();
                    const iconCenterX =
                      iconRect.left + iconRect.width / 2 - rect.left;
                    const iconCenterY =
                      iconRect.top + iconRect.height / 2 - rect.top;

                    const distanceX = mouseX - iconCenterX;
                    const distanceY = mouseY - iconCenterY;

                    // Inverse movement for parallax effect (closer items move more)
                    const moveX = distanceX * -0.03;
                    const moveY = distanceY * -0.03;
                    (
                      icon as HTMLElement
                    ).style.transform = `translate(${moveX}px, ${moveY}px)`;
                  });
                }}
                onMouseLeave={() => {
                  // Reset all icons when mouse leaves
                  const icons = document.querySelectorAll(".game-icon");
                  icons.forEach((icon) => {
                    (icon as HTMLElement).style.transform =
                      "translate(0px, 0px)";
                  });
                }}
              >
                <motion.a
                  href="https://discord.gg/gamertag"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, z: 30 }}
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-indigo-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 group"
                >
                  <motion.div
                    className="game-icon w-16 h-16 flex items-center justify-center bg-indigo-500/20 rounded-full mb-3 group-hover:shadow-lg group-hover:shadow-indigo-500/30"
                    whileHover={{ scale: 1.2, z: 40 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 9h.01M15 9h.01M9 15a3 3 0 0 0 6 0" />
                      <path d="M7.5 4h9a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5Z" />
                    </svg>
                  </motion.div>
                  <span className="font-bold text-white">Discord</span>
                  <span className="text-xs text-zinc-400">@gamertag</span>
                </motion.a>

                <motion.a
                  href="https://steamcommunity.com/id/gamertag"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, z: 30 }}
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-blue-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
                >
                  <motion.div
                    className="game-icon w-16 h-16 flex items-center justify-center bg-blue-500/20 rounded-full mb-3 group-hover:shadow-lg group-hover:shadow-blue-500/30"
                    whileHover={{ scale: 1.2, z: 40 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
                      <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z" />
                      <path d="M12 14a2 2 0 1 0 0-4" />
                      <path d="M12 14v7" />
                      <path d="M10 7v.01" />
                      <path d="M14 7v.01" />
                      <path d="M12 14v.01" />
                    </svg>
                  </motion.div>
                  <span className="font-bold text-white">Steam</span>
                  <span className="text-xs text-zinc-400">gamertag</span>
                </motion.a>

                <motion.a
                  href="https://open.spotify.com/user/gamertag"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, z: 30 }}
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-green-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 group"
                >
                  <motion.div
                    className="game-icon w-16 h-16 flex items-center justify-center bg-green-500/20 rounded-full mb-3 group-hover:shadow-lg group-hover:shadow-green-500/30"
                    whileHover={{ scale: 1.2, z: 40 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </motion.div>
                  <span className="font-bold text-white">Spotify</span>
                  <span className="text-xs text-zinc-400">Gaming Playlist</span>
                </motion.a>

                <motion.a
                  href="https://www.twitch.tv/gamertag"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, z: 30 }}
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-purple-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group"
                >
                  <motion.div
                    className="game-icon w-16 h-16 flex items-center justify-center bg-purple-500/20 rounded-full mb-3 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                    whileHover={{ scale: 1.2, z: 40 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
                    </svg>
                  </motion.div>
                  <span className="font-bold text-white">Twitch</span>
                  <span className="text-xs text-zinc-400">@gamertag</span>
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-zinc-400 mb-6">
                  Currently playing:{" "}
                  <span className="text-pink-400 font-semibold">
                    Cyberpunk 2077
                  </span>
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowKonamiCode(false)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg"
                >
                  Continue Exploring
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: smoothY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-cyan-500/10 opacity-30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,0,128,0.15),_transparent_70%)]"></div>

          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:40px_40px]"></div>
        </motion.div>

        <motion.div
          style={{ opacity, scale }}
          className="absolute top-4 right-4 z-50"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMode("cli")}
            title="Switch to CLI Mode"
            className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10"
          >
            <Terminal className="h-4 w-4" />
          </Button>
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-pink-500/30 shadow-lg shadow-pink-500/20 cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={handleLogoClick}
            >
              <img
                src={
                  portfolioData.about.photo ||
                  "/placeholder.svg?height=200&width=200"
                }
                alt={portfolioData.name}
                className="object-cover"
              />
            </motion.div>

            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              {portfolioData.name}
            </h1>

            <p className="text-2xl text-zinc-400 mb-8">{portfolioData.title}</p>

            <p className="max-w-2xl mx-auto text-zinc-300 leading-relaxed mb-12">
              {portfolioData.about.summary}
            </p>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="cursor-pointer"
            >
              <ChevronDown className="h-8 w-8 mx-auto text-pink-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section - Comic/Gaming Style with Parallax Text */}
      <section className="py-24 bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          {/* Parallax Text Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bio with Parallax Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border-2 border-pink-500/30 relative overflow-hidden"
            >
              {/* Comic-style corner */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500 -translate-x-12 -translate-y-12 rotate-45"></div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 text-pink-500 flex items-center">
                  <span className="inline-block w-8 h-[2px] bg-pink-500 mr-3"></span>
                  Bio
                </h3>

                <div className="space-y-6">
                  {portfolioData.about.bio.map(
                    (paragraph: string, index: number) => (
                      <motion.p
                        key={index}
                        className="text-zinc-300 leading-relaxed"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 5 }}
                      >
                        {paragraph}
                      </motion.p>
                    )
                  )}
                </div>
              </div>
            </motion.div>

            {/* Comic panels for experience and education */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border-2 border-cyan-500/30 relative overflow-hidden"
              >
                {/* Comic-style elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full translate-y-12 -translate-x-12"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6 text-cyan-500 flex items-center">
                    <span className="inline-block w-8 h-[2px] bg-cyan-500 mr-3"></span>
                    Experience
                  </h3>

                  <div className="space-y-6">
                    {portfolioData.about.experience.map(
                      (exp: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5, scale: 1.02 }}
                          className="bg-zinc-800/50 p-4 rounded-lg border-l-4 border-cyan-500"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white">
                              {exp.position}
                            </h4>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                              {exp.duration}
                            </Badge>
                          </div>
                          <p className="text-zinc-400 mt-1">{exp.company}</p>
                          <p className="text-zinc-500 text-sm mt-2">
                            {exp.description}
                          </p>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Education panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border-2 border-pink-500/30 relative overflow-hidden"
              >
                {/* Comic-style elements */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-pink-500/20 rounded-full -translate-y-8 -translate-x-8"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full translate-y-12 translate-x-12"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6 text-pink-500 flex items-center">
                    <span className="inline-block w-8 h-[2px] bg-pink-500 mr-3"></span>
                    Education
                  </h3>

                  <div className="space-y-6">
                    {portfolioData.about.education.map(
                      (edu: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5, scale: 1.02 }}
                          className="bg-zinc-800/50 p-4 rounded-lg border-l-4 border-pink-500"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white">
                              {edu.degree}
                            </h4>
                            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                              {edu.year}
                            </Badge>
                          </div>
                          <p className="text-zinc-400 mt-1">
                            {edu.institution}
                          </p>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Skills & Expertise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          {/* View mode toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-zinc-800 rounded-lg p-2 flex items-center gap-3">
              <span
                className={`text-sm ${
                  skillViewMode === "grid" ? "text-pink-400" : "text-zinc-400"
                }`}
              >
                Grid View
              </span>
              <Switch
                checked={skillViewMode === "orbital"}
                onCheckedChange={(checked) =>
                  setSkillViewMode(checked ? "orbital" : "grid")
                }
                className="data-[state=checked]:bg-pink-500"
              />
              <span
                className={`text-sm ${
                  skillViewMode === "orbital"
                    ? "text-pink-400"
                    : "text-zinc-400"
                }`}
              >
                Orbital View
              </span>
            </div>
          </div>

          {/* 3D Skill Hexagons - Orbital View */}
          {skillViewMode === "orbital" && (
            <div className="relative h-[500px] mb-16 hidden md:block">
              <div className="absolute inset-0">
                {Object.entries(portfolioData.skills).map(
                  (
                    [category, skills]: [string, any],
                    categoryIndex: number
                  ) => {
                    const totalCategories = Object.keys(
                      portfolioData.skills
                    ).length;
                    const angle =
                      (categoryIndex / totalCategories) * Math.PI * 2;
                    const radius = 180;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: categoryIndex * 0.1,
                        }}
                        viewport={{ once: true }}
                        className="absolute"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10, zIndex: 10 }}
                          className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-pink-500/30 text-white rounded-xl shadow-lg cursor-pointer relative group"
                          onClick={() => {}} // Empty function to show it's clickable
                        >
                          {category === "frontend" && (
                            <Code className="h-8 w-8 text-pink-400" />
                          )}
                          {category === "backend" && (
                            <Terminal className="h-8 w-8 text-cyan-400" />
                          )}
                          {category === "database" && (
                            <Coffee className="h-8 w-8 text-yellow-400" />
                          )}
                          {category === "devops" && (
                            <Gamepad className="h-8 w-8 text-green-400" />
                          )}
                          {category === "tools" && (
                            <Music className="h-8 w-8 text-purple-400" />
                          )}
                          {![
                            "frontend",
                            "backend",
                            "database",
                            "devops",
                            "tools",
                          ].includes(category) && (
                            <Heart className="h-8 w-8 text-red-400" />
                          )}

                          {/* Skills popup on hover */}
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-zinc-800 border border-pink-500/30 rounded-lg p-4 shadow-lg z-20 pointer-events-none">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-zinc-800 border-r border-b border-pink-500/30"></div>
                            <h3 className="text-lg font-semibold capitalize mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                              {category}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {(skills as string[]).map(
                                (skill: string, skillIndex: number) => (
                                  <Badge
                                    key={skillIndex}
                                    variant="secondary"
                                    className="bg-zinc-900 text-zinc-300"
                                  >
                                    {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  }
                )}

                {/* Center node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/30 to-cyan-500/30 border-2 border-pink-500/50 flex items-center justify-center text-white shadow-lg shadow-pink-500/20"
                >
                  <div className="text-center">
                    <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                      {portfolioData.name.split(" ")[0]}
                    </h3>
                    <p className="text-xs text-zinc-400">Full Stack</p>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Skill cards - Grid View (always shown on mobile) */}
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ${
              skillViewMode === "orbital" ? "md:hidden" : ""
            }`}
          >
            {Object.entries(portfolioData.skills).map(
              ([category, skills]: [string, any], index: number) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full bg-zinc-800 border-zinc-700 group-hover:border-pink-500/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-6 capitalize text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center">
                        {category === "frontend" && (
                          <Code className="h-5 w-5 mr-2 text-pink-400" />
                        )}
                        {category === "backend" && (
                          <Terminal className="h-5 w-5 mr-2 text-cyan-400" />
                        )}
                        {category === "database" && (
                          <Coffee className="h-5 w-5 mr-2 text-yellow-400" />
                        )}
                        {category === "devops" && (
                          <Gamepad className="h-5 w-5 mr-2 text-green-400" />
                        )}
                        {category === "tools" && (
                          <Music className="h-5 w-5 mr-2 text-purple-400" />
                        )}
                        {![
                          "frontend",
                          "backend",
                          "database",
                          "devops",
                          "tools",
                        ].includes(category) && (
                          <Heart className="h-5 w-5 mr-2 text-red-400" />
                        )}
                        {category}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {(skills as string[]).map(
                          (skill: string, skillIndex: number) => (
                            <motion.div
                              key={skillIndex}
                              className="bg-zinc-900 px-3 py-1 rounded-md text-sm text-zinc-300 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-cyan-500/20 hover:text-white transition-colors duration-300 cursor-default"
                              whileHover={{ scale: 1.05 }}
                            >
                              {skill}
                            </motion.div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Hobbies Section - NEW */}
      <section className="py-24 bg-gradient-to-b from-zinc-900 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Hobbies & Interests
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gaming Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border-2 border-pink-500/30 relative overflow-hidden"
            >
              {/* Comic-style elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full translate-y-16 -translate-x-16"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-pink-500 flex items-center">
                  <Gamepad className="h-6 w-6 mr-3" />
                  Gaming Interests
                </h3>

                <p className="text-zinc-300 mb-6">
                  When I'm not coding, you'll find me immersed in various gaming
                  worlds. I enjoy both competitive and story-driven games across
                  different platforms.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-zinc-800/50 p-4 rounded-lg border-b-4 border-purple-500 text-center"
                  >
                    <Gamepad className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <h4 className="font-bold text-white">RPG</h4>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="bg-zinc-800/50 p-4 rounded-lg border-b-4 border-cyan-500 text-center"
                  >
                    <Code className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                    <h4 className="font-bold text-white">Strategy</h4>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-zinc-800/50 p-4 rounded-lg border-b-4 border-pink-500 text-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mx-auto mb-2 text-pink-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    <h4 className="font-bold text-white">Action</h4>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="bg-zinc-800/50 p-4 rounded-lg border-b-4 border-yellow-500 text-center"
                  >
                    <Coffee className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <h4 className="font-bold text-white">Indie</h4>
                  </motion.div>
                </div>

                {/* Konami Code Visual Display */}
                <div className="mt-8 bg-zinc-800/80 rounded-lg p-4 border border-pink-500/30">
                  <h4 className="text-lg font-semibold mb-3 text-center text-pink-400">
                    Secret Konami Code
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {konamiCode.map((key, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-700 rounded-md border border-pink-500/30 text-white font-bold text-sm"
                      >
                        {key === "ArrowUp" && "↑"}
                        {key === "ArrowDown" && "↓"}
                        {key === "ArrowLeft" && "←"}
                        {key === "ArrowRight" && "→"}
                        {key === "b" && "B"}
                        {key === "a" && "A"}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-center mt-3 text-zinc-400">
                    Try the Konami code to unlock a special gaming mode!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Music Section with Spotify Embeds */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border-2 border-cyan-500/30 relative overflow-hidden"
            >
              {/* Comic-style elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full translate-y-16 translate-x-16"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-cyan-500 flex items-center">
                  <Music className="h-6 w-6 mr-3" />
                  Music Favorites
                </h3>

                <p className="text-zinc-300 mb-6">
                  Music is an essential part of my creative process. Here are
                  some of my favorite playlists that keep me in the zone while
                  coding.
                </p>

                <div className="space-y-6">
                  {/* Spotify Embed 1 */}
                  <div className="bg-zinc-800 rounded-lg overflow-hidden">
                    <iframe
                      src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </div>

                  {/* Spotify Embed 2 */}
                  <div className="bg-zinc-800 rounded-lg overflow-hidden">
                    <iframe
                      src="https://open.spotify.com/embed/playlist/37i9dQZF1DX5trt9i14X7j?utm_source=generator"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </div>

                  {/* Spotify Embed 3 */}
                  <div className="bg-zinc-800 rounded-lg overflow-hidden">
                    <iframe
                      src="https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Featured Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          <div className="space-y-16">
            {featuredProjects.map((project: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="group"
                onMouseMove={handleMouseMove}
                style={{ perspective: 1000 }}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={`${index % 2 === 1 ? "md:order-2" : ""}`}>
                    <motion.div
                      style={{ rotateX, rotateY }}
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800"
                    >
                      <img
                        src={
                          project.image ||
                          "/placeholder.svg?height=300&width=500"
                        }
                        alt={project.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 mb-4">{project.description}</p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {project.technologies.map(
                        (tech: string, techIndex: number) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            {tech}
                          </Badge>
                        )
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        asChild
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Project
                        </a>
                      </Button>
                      {project.github && (
                        <Button
                          asChild
                          variant="outline"
                          className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="mr-2 h-4 w-4" />
                            Source Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-24 mb-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Other Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProjects.map((project: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full flex flex-col bg-zinc-900 border-zinc-800 group-hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={
                        project.image || "/placeholder.svg?height=200&width=300"
                      }
                      alt={project.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                  </div>
                  <CardContent className="p-6 flex-grow">
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 mb-4 text-sm">
                      {project.description}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {project.technologies
                        .slice(0, 3)
                        .map((tech: string, techIndex: number) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            {tech}
                          </Badge>
                        ))}
                      {project.technologies.length > 3 && (
                        <Badge
                          variant="outline"
                          className="border-zinc-700 text-zinc-400"
                        >
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts Section - Easter Egg */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Fun Facts
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center"
            >
              <Coffee className="h-10 w-10 mx-auto mb-4 text-pink-500" />
              <h3 className="text-xl font-semibold mb-2">Coffee Consumed</h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                1,248 Cups
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center"
            >
              <Code className="h-10 w-10 mx-auto mb-4 text-cyan-500" />
              <h3 className="text-xl font-semibold mb-2">Lines of Code</h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                1.2M+
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center"
            >
              <Gamepad className="h-10 w-10 mx-auto mb-4 text-pink-500" />
              <h3 className="text-xl font-semibold mb-2">Games Played</h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                347
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center"
            >
              <Music className="h-10 w-10 mx-auto mb-4 text-cyan-500" />
              <h3 className="text-xl font-semibold mb-2">Spotify Hours</h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                4,320
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section - Indie Game UI Style */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Get In Touch
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          {/* Indie Game UI Style Contact */}
          <div className="max-w-5xl mx-auto">
            {/* Game Console Frame */}
            <div className="bg-zinc-900 border-4 border-zinc-700 rounded-xl p-6 shadow-[0_0_15px_rgba(255,0,128,0.3)] relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-pink-500"></div>

              {/* Console Lights */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <div
                  className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-green-500 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>

              {/* Game Screen */}
              <div className="bg-zinc-800 rounded-lg p-6 border-2 border-zinc-600 mb-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 inline-block">
                    PLAYER COMMUNICATION TERMINAL
                  </h3>
                  <div className="mt-2 text-xs text-zinc-500 uppercase tracking-widest">
                    System v1.0.4 // Ready for input
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Contact Info - Left Side */}
                  <div className="space-y-4">
                    <div className="text-lg font-bold text-pink-400 mb-4 flex items-center">
                      <div className="w-2 h-6 bg-pink-500 mr-3"></div>
                      CONTACT DATA
                    </div>

                    {contactItems.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-md border border-zinc-700 hover:border-pink-500/50 transition-colors duration-300"
                        whileHover={{
                          x: 5,
                          backgroundColor: "rgba(236, 72, 153, 0.1)",
                        }}
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-md text-pink-400 border border-pink-500/30">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-400 text-xs uppercase tracking-wider">
                            {item.label}
                          </div>
                          <a
                            href={
                              item.label.toLowerCase() === "email"
                                ? `mailto:${item.value}`
                                : item.label.toLowerCase() === "phone"
                                ? `tel:${item.value}`
                                : item.value
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-pink-400 transition-colors duration-300"
                          >
                            {item.value}
                          </a>
                        </div>
                      </motion.div>
                    ))}

                    <div className="mt-6 text-xs text-zinc-500 font-mono">
                      <span className="text-pink-500">&gt;</span> Connection
                      secure. Awaiting message...
                    </div>
                  </div>

                  {/* Message Form - Right Side */}
                  <div className="bg-zinc-900/50 rounded-md border-2 border-zinc-700 p-4">
                    <div className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                      <div className="w-2 h-6 bg-cyan-500 mr-3"></div>
                      SEND MESSAGE
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-zinc-400 text-xs uppercase tracking-wider"
                        >
                          Name <span className="text-pink-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-zinc-800 border-zinc-700 focus:border-cyan-500 text-white pl-10"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-zinc-400 text-xs uppercase tracking-wider"
                        >
                          Email <span className="text-pink-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-zinc-800 border-zinc-700 focus:border-cyan-500 text-white pl-10"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-zinc-400 text-xs uppercase tracking-wider"
                        >
                          Message <span className="text-pink-500">*</span>
                        </Label>
                        <div className="relative">
                          <Textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="bg-zinc-800 border-zinc-700 focus:border-cyan-500 text-white resize-none pl-10 pt-8"
                          />
                          <div className="absolute left-3 top-6 text-cyan-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <div className="absolute top-2 left-10 right-2">
                            <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-pink-500 to-cyan-500"
                                initial={{ width: "0%" }}
                                animate={{
                                  width: formData.message
                                    ? `${Math.min(
                                        100,
                                        formData.message.length / 2
                                      )}%`
                                    : "0%",
                                }}
                                transition={{ duration: 0.3 }}
                              ></motion.div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full mt-4 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white py-3 rounded-md font-bold relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 w-3/4 h-full bg-gradient-to-r from-pink-600/50 to-transparent animate-[shimmer_2s_infinite] z-0"></div>
                        <span className="relative z-10 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                          TRANSMIT MESSAGE
                        </span>
                      </motion.button>
                    </form>

                    <div className="mt-4 text-xs text-zinc-500 font-mono flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span>
                        System ready // All fields marked{" "}
                        <span className="text-pink-500">*</span> required
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Controls */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-12 bg-pink-500/30 rounded-sm"></div>
                  <div className="w-3 h-12 bg-cyan-500/30 rounded-sm"></div>
                </div>

                <div className="text-xs text-zinc-500 font-mono">
                  PORTFOLIO OS v2.0 //{" "}
                  <span className="text-pink-500">CONTACT MODULE</span> //{" "}
                  {new Date().toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <div className="w-3 h-12 bg-cyan-500/30 rounded-sm"></div>
                  <div className="w-3 h-12 bg-pink-500/30 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500">
            &copy; {new Date().getFullYear()} {portfolioData.name}. All rights
            reserved.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMode("cli")}
            className="mt-4 text-cyan-500 hover:text-cyan-400 hover:bg-transparent"
          >
            <Terminal className="mr-2 h-4 w-4" />
            Switch to CLI Mode
          </Button>
        </div>
      </footer>
    </div>
  );
}
