import { Coffee, Gamepad, Music, Code } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type JSX } from "react";

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

interface HobbiesAndInterestsProps {
  data: {
    gamingCategories: string[];
    musicPlaylists: string[];
  };
}

export const HobbiesAndInterests = ({ data }: HobbiesAndInterestsProps) => {
  const [showKonamiCode, setShowKonamiCode] = useState(false);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [skillViewMode, setSkillViewMode] = useState<"grid" | "orbital">(
    "orbital"
  );
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isModalBouncing, setIsModalBouncing] = useState(false);

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

  // Reference to the viewport
  const viewportRef = useRef<HTMLDivElement>(null);

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

  return (
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
