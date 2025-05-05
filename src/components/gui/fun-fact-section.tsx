import { motion } from "framer-motion";
import { Coffee, Code, Gamepad, Music } from "lucide-react";
import type { JSX } from "react";
interface FunFact {
  title: string;
  fact: string;
}

interface FunFactSectionProps {
  data: FunFact[];
}

const iconMap: Record<string, JSX.Element> = {
  coffee: <Coffee className="h-10 w-10 mx-auto mb-4 text-pink-500" />,
  code: <Code className="h-10 w-10 mx-auto mb-4 text-cyan-500" />,
  game: <Gamepad className="h-10 w-10 mx-auto mb-4 text-pink-500" />,
  music: <Music className="h-10 w-10 mx-auto mb-4 text-cyan-500" />,
};

const getIcon = (title: string) => {
  const key = title.toLowerCase();
  if (key.includes("coffee")) return iconMap.coffee;
  if (key.includes("code")) return iconMap.code;
  if (key.includes("game")) return iconMap.game;
  if (key.includes("spotify") || key.includes("music")) return iconMap.music;
  return null;
};

const FunFactSection = ({ data }: FunFactSectionProps) => {
  return (
    <section className="py-24 bg-black px-0 lg:px-16">
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
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center"
            >
              {getIcon(item.title)}
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                {item.fact}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FunFactSection;
