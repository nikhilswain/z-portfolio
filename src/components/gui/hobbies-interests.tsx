import { Coffee, Gamepad, Music, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/ui/parllax-card-3d";

import type { JSX } from "react";

const KONAMI_SEQUENCE = [
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

interface HobbiesAndInterestsProps {
  data: {
    gamingCategories: string[];
    musicPlaylists: string[];
  };
}

export const HobbiesAndInterests = ({ data }: HobbiesAndInterestsProps) => {
  const [showKonamiCode, setShowKonamiCode] = useState(false);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [lastActivation, setLastActivation] = useState(0);
  const [modalClosed, setModalClosed] = useState(false);

  const categoryMap: Record<
    string,
    { icon: JSX.Element; borderColor: string }
  > = {
    RPG: {
      icon: <Gamepad className="h-8 w-8 mx-auto mb-2 text-purple-400" />,
      borderColor: "border-purple-500",
    },
    Strategy: {
      icon: <Code className="h-8 w-8 mx-auto mb-2 text-cyan-400" />,
      borderColor: "border-cyan-500",
    },
    Action: {
      icon: (
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
      ),
      borderColor: "border-pink-500",
    },
    Indie: {
      icon: <Coffee className="h-8 w-8 mx-auto mb-2 text-yellow-400" />,
      borderColor: "border-yellow-500",
    },
  };

  // Add a ref for the modal
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip detection if modal was just closed
      if (modalClosed) {
        return;
      }

      // Add the new key to our sequence
      const newSequence = [...konamiSequence, e.key];

      // Keep only the last N keys where N is the length of the Konami sequence
      if (newSequence.length > KONAMI_SEQUENCE.length) {
        newSequence.splice(0, newSequence.length - KONAMI_SEQUENCE.length);
      }

      setKonamiSequence(newSequence);

      // Check if our current sequence matches the Konami code
      const isKonamiCode =
        newSequence.length === KONAMI_SEQUENCE.length &&
        newSequence.every((key, i) => key === KONAMI_SEQUENCE[i]);

      // Only activate if we haven't just activated (prevents double triggers)
      const now = Date.now();
      if (isKonamiCode && now - lastActivation > 1000) {
        setShowKonamiCode(true);
        setLastActivation(now);
        setKonamiSequence([]);
        // Lock body scroll when modal is open
        document.body.style.overflow = "hidden";
      }

      // Close modal with ESC key
      if (e.key === "Escape" && showKonamiCode) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiSequence, showKonamiCode, lastActivation, modalClosed]);

  // Reset modalClosed flag after a delay
  useEffect(() => {
    if (modalClosed) {
      const timer = setTimeout(() => {
        setModalClosed(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [modalClosed]);

  // Function to close the modal
  const closeModal = () => {
    setShowKonamiCode(false);
    setModalClosed(true);
    setKonamiSequence([]);
    setLastActivation(0);
    document.body.style.overflow = "auto";
  };

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (showKonamiCode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showKonamiCode]);

  useEffect(() => {
    console.log("Modal closed:", modalClosed, showKonamiCode);
  }, [modalClosed, showKonamiCode]);

  return (
    <section
      className="min-h-screen py-24 bg-gradient-to-b from-zinc-900 to-black relative px-0 lg:px-16"
      key={showKonamiCode ? "modal-open" : "modal-close"}
    >
      {/* Konami Code Easter Egg */}
      {showKonamiCode && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl rounded-xl border-4 border-pink-500/50 p-8 overflow-hidden"
          >
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 z-2" 
              style={{
                backgroundImage: "url('/genshin-impact.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.3,
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-br from-zinc-900 to-zinc-800/95" />

            {/* Comic-style elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -translate-y-32 translate-x-32 z-[2]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full translate-y-32 -translate-x-32 z-[2]"></div>

            {/* Comic-style corner */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500 -translate-x-12 -translate-y-12 rotate-45 z-[2]"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500 translate-x-12 -translate-y-12 rotate-45 z-[2]"></div>

            {/* Content */}
            <div className="relative z-[3]">
              <h2 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                🎮 GAMER MODE ACTIVATED! 🎮
              </h2>

              <div className="mb-8 text-center">
                <p className="text-xl text-zinc-300">
                  I'm a passionate gamer too! Let's connect and play together.
                </p>
                <p className="text-sm text-zinc-300 mt-2">
                  Press ESC to close the modal
                </p>
              </div>

              <div className="grid grid-cols-2 justify-center sm:grid-cols-4 gap-6 mb-8">
                <motion.a
                  href="https://discord.com/users/568448885450866712"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-indigo-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 group"
                >
                  <CardContainer className="inter-var">
                    <CardBody className="w-16 h-16 [transform-style:preserve-3d] flex items-center justify-center">
                      <CardItem
                        translateZ={100}
                        className="game-icon w-16 h-16 flex items-center justify-center bg-indigo-500/20 rounded-full group-hover:shadow-lg group-hover:shadow-indigo-500/30"
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
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                  <span className="font-bold text-white mt-3">Discord</span>
                  <span className="text-xs text-zinc-400">zero.02</span>
                </motion.a>

                <motion.a
                  href="https://steamcommunity.com/profiles/76561199438372590/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-blue-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
                >
                  <CardContainer className="inter-var">
                    <CardBody className="w-16 h-16 [transform-style:preserve-3d] flex items-center justify-center">
                      <CardItem
                        translateZ={100}
                        className="game-icon w-16 h-16 flex items-center justify-center bg-blue-500/20 rounded-full group-hover:shadow-lg group-hover:shadow-blue-500/30"
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
                      </CardItem>
                    </CardBody>
                  </CardContainer>

                  <span className="font-bold text-white mt-3">Steam</span>
                  <span className="text-xs text-zinc-400">zero</span>
                </motion.a>

                <motion.a
                  href="https://open.spotify.com/user/fp0swtvc1n1gqzeglkg7jga22?si=1de762b285264030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-green-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 group"
                >
                  <CardContainer className="inter-var">
                    <CardBody className="w-16 h-16 [transform-style:preserve-3d] flex items-center justify-center">
                      <CardItem
                        translateZ={100}
                        className="game-icon w-16 h-16 flex items-center justify-center bg-green-500/20 rounded-full group-hover:shadow-lg group-hover:shadow-green-500/30"
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
                      </CardItem>
                    </CardBody>
                  </CardContainer>

                  <span className="font-bold text-white mt-3">Spotify</span>
                  <span className="text-xs text-zinc-400">zero</span>
                </motion.a>

                <motion.a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center bg-zinc-800/80 p-4 rounded-lg border-2 border-purple-500/50 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group"
                >
                  <CardContainer className="inter-var">
                    <CardBody className="w-16 h-16 [transform-style:preserve-3d] flex items-center justify-center">
                      <CardItem
                        translateZ={100}
                        className="game-icon w-16 h-16 flex items-center justify-center bg-purple-500/20 rounded-full group-hover:shadow-lg group-hover:shadow-purple-500/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="1 1 998.013 998.025"
                        >
                          <path d="M500.006 1C224.852 1 1 224.855 1 500.014s223.852 499.011 499.006 499.011c275.155 0 499.007-223.852 499.007-499.011C999.014 224.855 775.161 1 500.006 1zm0 933.393c-239.517 0-434.374-194.862-434.374-434.379 0-239.521 194.858-434.382 434.374-434.382 239.513 0 434.375 194.862 434.375 434.382 0 239.516-194.861 434.379-434.375 434.379zm169.532-579.932h3.938v-19.075h7.098v-3.368h-18.117v3.368h7.082l-.001 19.075zm17.319-17.342h.072l6.225 17.342h3.207l6.224-17.342h.088v17.342h3.698v-22.442h-5.436l-6.016 17.554h-.104l-6.162-17.554h-5.524v22.442h3.729v-17.342zm-113.33-5.12H328.04l-37.246 59.858h245.203l37.53-59.858zm50.168.571L473.623 571.533H307.159l38.405-59.908h99.771l38.111-59.881H252.794l-38.104 59.881h54.642l-75.813 119.61h316.389l116.86-184.295 42.609 64.684h-38.42l-36.386 59.909h113.773l39.506 59.702h72.576L623.695 332.57z" />
                        </svg>
                      </CardItem>
                    </CardBody>
                  </CardContainer>

                  <span className="font-bold text-white mt-3">EA Sports</span>
                  <span className="text-xs text-zinc-400">n1kh1lswa</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
                {data.gamingCategories.map((category, index) => {
                  const config = categoryMap[category];
                  if (!config) return null;

                  return (
                    <motion.div
                      key={category}
                      whileHover={{
                        scale: 1.05,
                        rotate: index % 2 === 0 ? 2 : -2,
                      }}
                      className={`bg-zinc-800/50 p-4 rounded-lg border-b-4 ${config.borderColor} text-center`}
                    >
                      {config.icon}
                      <h4 className="font-bold text-white">{category}</h4>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 bg-zinc-800/80 rounded-lg p-4 border border-pink-500/30">
                <h4 className="text-lg font-semibold mb-3 text-center text-pink-400">
                  Secret Konami Code
                </h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {KONAMI_SEQUENCE.map((key, index) => (
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

          {/* Music Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border-2 border-cyan-500/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-16 -translate-x-16"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full translate-y-16 translate-x-16"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-cyan-500 flex items-center">
                <Music className="h-6 w-6 mr-3" />
                Music Favorites
              </h3>

              <p className="text-zinc-300 mb-6">
                Music is an essential part of my creative process. Here are some
                of my favorite songs that keep me in the zone while coding.
              </p>

              <div className="space-y-6">
                {data.musicPlaylists.map((playlist, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800 rounded-lg overflow-hidden"
                  >
                    <iframe
                      style={{ borderRadius: "12px" }}
                      src={`${playlist}?utm_source=generator`}
                      width="100%"
                      height="152"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
