import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

interface ProjectsProps {
  data: {
    title: string;
    description: string;
    image?: string;
    technologies: string[];
    link: string;
    github?: string;
    featured?: boolean;
  }[];
}

export function Projects({ data }: ProjectsProps) {
  // Separate featured projects
  const featuredProjects = data.filter((project) => project.featured);
  const regularProjects = data.filter((project) => !project.featured);

  return (
    <div className="space-y-12">
      {featuredProjects.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
            Featured Projects
          </h2>
          <div className="grid gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden bg-zinc-900 border-zinc-800 group-hover:border-pink-500/50 transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                    </div>
                    <div className="p-6 flex flex-col">
                      <CardTitle className="text-xl mb-2 text-white group-hover:text-pink-400 transition-colors duration-300">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="flex-grow text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                        {project.description}
                      </CardDescription>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button
                          asChild
                          size="sm"
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
                            size="sm"
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
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
          All Projects
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularProjects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white group-hover:text-cyan-400 transition-colors duration-300">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                    {project.description}
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
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
                <CardFooter className="flex gap-3">
                  <Button
                    asChild
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </a>
                  </Button>
                  {project.github && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
                    >
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
