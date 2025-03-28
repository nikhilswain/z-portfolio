"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SkillsProps {
  data: {
    [category: string]: string[] | { name: string; level: number }[];
  };
}

export function Skills({ data }: SkillsProps) {
  // Check if skills have levels
  const hasLevels = Object.values(data).some(
    (skills) =>
      Array.isArray(skills) &&
      typeof skills[0] === "object" &&
      "level" in skills[0]
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 mb-6">
        Skills & Expertise
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(data).map(([category, skills], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="h-full bg-zinc-900 border-zinc-800 group-hover:border-pink-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="capitalize text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasLevels ? (
                  <div className="space-y-4">
                    {(skills as { name: string; level: number }[]).map(
                      (skill, index) => (
                        <div key={index} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-300 group-hover:text-white transition-colors duration-300">
                              {skill.name}
                            </span>
                            <span className="text-zinc-400">
                              {skill.level}%
                            </span>
                          </div>
                          <Progress
                            value={skill.level}
                            className="h-2 bg-zinc-800"
                            indicatorClassName="bg-gradient-to-r from-pink-500 to-cyan-500"
                          />
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(skills as string[]).map((skill, index) => (
                      <motion.div
                        key={index}
                        className="bg-zinc-800 px-3 py-1 rounded-md text-sm text-zinc-300 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-cyan-500/20 hover:text-white transition-colors duration-300 cursor-default"
                        whileHover={{ scale: 1.05 }}
                      >
                        {skill}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
