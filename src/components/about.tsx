"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface AboutProps {
  data: {
    name: string;
    title: string;
    summary: string;
    photo?: string;
    bio: string[];
    education: {
      degree: string;
      institution: string;
      year: string;
    }[];
    experience: {
      position: string;
      company: string;
      duration: string;
      description: string;
    }[];
  };
}

export function About({ data }: AboutProps) {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-3xl mx-auto"
      >
        <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-pink-500/30 shadow-lg shadow-pink-500/20">
          <img
            src={data.photo || "/placeholder.svg?height=200&width=200"}
            alt={data.name}
            className="object-cover"
          />
        </div>

        <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
          {data.name}
        </h2>

        <p className="text-xl text-zinc-400 mb-6">{data.title}</p>

        <p className="text-zinc-300 leading-relaxed max-w-2xl">
          {data.summary}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="bg-zinc-900 border-zinc-800 hover:border-pink-500/50 transition-all duration-300 overflow-hidden group">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-pink-500 flex items-center">
              <span className="inline-block w-8 h-[2px] bg-pink-500 mr-3"></span>
              Bio
            </h3>

            <div className="space-y-4">
              {data.bio.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-cyan-500 flex items-center">
                <span className="inline-block w-8 h-[2px] bg-cyan-500 mr-3"></span>
                Education
              </h3>

              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <HoverCard key={index}>
                    <HoverCardTrigger asChild>
                      <div className="cursor-pointer group/item">
                        <h4 className="font-medium text-white group-hover/item:text-cyan-400 transition-colors duration-300">
                          {edu.degree}
                        </h4>
                        <p className="text-zinc-400 group-hover/item:text-zinc-300 transition-colors duration-300">
                          {edu.institution}
                        </p>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-zinc-900 border border-zinc-800">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-sm text-zinc-400">
                            {edu.institution}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        >
                          {edu.year}
                        </Badge>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 hover:border-pink-500/50 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-pink-500 flex items-center">
                <span className="inline-block w-8 h-[2px] bg-pink-500 mr-3"></span>
                Experience
              </h3>

              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <HoverCard key={index}>
                    <HoverCardTrigger asChild>
                      <div className="cursor-pointer group/item">
                        <h4 className="font-medium text-white group-hover/item:text-pink-400 transition-colors duration-300">
                          {exp.position}
                        </h4>
                        <p className="text-zinc-400 group-hover/item:text-zinc-300 transition-colors duration-300">
                          {exp.company}
                        </p>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-zinc-900 border border-zinc-800">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">{exp.position}</h4>
                          <Badge
                            variant="outline"
                            className="bg-pink-500/10 text-pink-400 border-pink-500/30"
                          >
                            {exp.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400">{exp.company}</p>
                        <p className="text-sm text-zinc-300">
                          {exp.description}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
