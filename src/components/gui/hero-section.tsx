import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Terminal, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  data: {
    name: string;
    title: string;
    about: {
      summary: string;
      photo: string;
    };
  };
  onSwitchMode: () => void;
}

export function HeroSection({ data, onSwitchMode }: HeroSectionProps) {
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.9]);

  // Parallax effect for hero section
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const smoothY = useSpring(heroY, springConfig);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: smoothY }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-cyan-500/10 opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,0,128,0.15),_transparent_70%)]"></div>
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px]"></div>
      </motion.div>

      <motion.div
        style={{ opacity, scale }}
        className="absolute top-4 right-4 z-50"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={onSwitchMode}
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
          >
            <img
              src={data.about.photo || "/placeholder.svg?height=200&width=200"}
              alt={data.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
            {data.name}
          </h1>

          <p className="text-2xl text-zinc-400 mb-8">{data.title}</p>

          <p className="max-w-2xl mx-auto text-zinc-300 leading-relaxed mb-12">
            {data.about.summary}
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
  );
}
