"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { Code, Terminal, Coffee, Gamepad, Music, Heart } from "lucide-react";
import { IconCloud } from "@/components/ui/icon-cloud";
import { ShowOnScreenSize } from "@/lib/useScreenSize";

const slugs = [
  "typescript",
  "javascript",
  "react",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "vercel",
  "testinglibrary",
  "jest",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "figma",
];

interface SkillsSectionProps {
  data: {
    [category: string]: string[];
  };
}

export function SkillsSection({ data }: SkillsSectionProps) {
  const [skillViewMode, setSkillViewMode] = useState<"grid" | "orbital">(
    "orbital"
  );

  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`
  );

  return (
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
        <ShowOnScreenSize mobile={false} tablet={false}>
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
        </ShowOnScreenSize>

        {/* 3D Skill Hexagons - Orbital View */}
        {skillViewMode === "orbital" && (
          <div className="relative h-[600px] mb-16 hidden md:block">
            <div className="absolute inset-0">
              {Object.entries(data).map(([category, skills], categoryIndex) => {
                const totalCategories = Object.keys(data).length;
                const angleOffset = -Math.PI / 2;
                const angle =
                  (categoryIndex / totalCategories) * Math.PI * 2 + angleOffset;
                const radius = 230; // Slightly reduced radius
                const verticalStretch = 0.9; // Vertical compression
                const horizontalStretch = 0.9; // Horizontal compression to bring in right side cards
                const x = Math.cos(angle) * radius * horizontalStretch;
                const y = Math.sin(angle) * radius * verticalStretch;

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: categoryIndex * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    viewport={{ once: true }}
                    className="absolute z-10"
                    style={{
                      left: `calc(50% + ${x - 40}px)`,
                      top: `calc(50% + ${y - 40}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10, zIndex: 10 }}
                      className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-pink-500/30 text-white rounded-xl shadow-lg cursor-none relative group"
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
                          {skills.map((skill, skillIndex) => (
                            <Badge
                              key={skillIndex}
                              variant="secondary"
                              className="bg-zinc-900 text-zinc-300"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Center node */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-0"
              >
                <IconCloud images={images} />
              </motion.div>
            </div>
          </div>
        )}

        {/* Skill cards - Grid View (always shown on mobile) */}
        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ${
            skillViewMode === "orbital" ? "lg:hidden" : ""
          }`}
        >
          {Object.entries(data).map(([category, skills], index) => (
            <MagicCard
              key={category}
              className="h-full"
              backgroundClassName="bg-zinc-800 border-zinc-700 transition-all duration-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
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
                  {skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skillIndex}
                      className="bg-zinc-900 px-3 py-1 rounded-md text-sm text-zinc-300 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-cyan-500/20 hover:text-white transition-colors duration-300 cursor-none"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {skill}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}
