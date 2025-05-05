import { Coffee, Gamepad, Music, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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

  // Reference to the viewport
  const viewportRef = useRef<HTMLDivElement>(null);

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
    // First hide the modal
    setShowKonamiCode(false);

    // Mark that the modal was just closed to prevent immediate reactivation
    setModalClosed(true);

    // Reset sequence when closing
    setKonamiSequence([]);

    // Reset the last activation timestamp to allow reactivation after cool down
    setLastActivation(0);

    // Force focus back to the main window to ensure keyboard events are captured
    if (viewportRef.current) {
      viewportRef.current.focus();
    }

    // Ensure document body isn't locked
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
      // Lock body scroll when modal is open
      document.body.style.overflow = "hidden";
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
      ref={viewportRef}
      tabIndex={-1} // Make it focusable
    >
      {/* Konami Code Easter Egg */}
      <AnimatePresence>
        {showKonamiCode && (
          <motion.div
            key={showKonamiCode ? "modal" : "modal-closed"}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70"
          >
            <motion.div
              ref={modalRef}
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
              {/* <motion.button
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
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
              </motion.button> */}

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
                    Press ESC to close the modal
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
                      (icon as HTMLElement).style.transform =
                        `translate(${moveX}px, ${moveY}px)`;
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
                    <span className="text-xs text-zinc-400">
                      Gaming Playlist
                    </span>
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
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                of my favorite playlists that keep me in the zone while coding.
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
