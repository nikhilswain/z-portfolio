import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import { ParllaxCard } from "@/components/ui/parllax-card";
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/ui/parllax-card-3d";

interface ProjectsSectionProps {
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

export function ProjectsSection({ data }: ProjectsSectionProps) {
  // Separate featured projects
  const featuredProjects = data.filter((project) => project.featured);
  const regularProjects = data.filter((project) => !project.featured);

  return (
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
          {featuredProjects.map((project, index) => (
            <ParllaxCard
              key={index}
              className="group"
              glowColor={
                index % 2 === 0
                  ? "rgba(236, 72, 153, 0.5)"
                  : "rgba(34, 211, 238, 0.5)"
              }
              imageSelector=".project-image"
              textSelector=".project-title"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className={`${index % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800">
                    <img
                      src={
                        project.image || "/placeholder.svg?height=300&width=500"
                      }
                      alt={project.title}
                      className="inset-0 w-full h-full absolute object-cover transition-transform duration-500 group-hover:scale-110 project-image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 project-title">
                    {project.title}
                  </h3>
                  <p className="text-zinc-400 mb-4">{project.description}</p>

                  <div className="mb-6 flex flex-wrap gap-2">
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
            </ParllaxCard>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularProjects.map((project, index) => (
            <CardContainer key={index} className="inter-var">
              <CardBody className="relative group/card dark:hover:shadow-2xl dark:hover:shadow-cyan-500/[0.1] bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 w-full h-full rounded-xl p-6 transition-colors duration-300">
                <CardItem translateZ="100" className="w-full">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src={
                        project.image || "/placeholder.svg?height=200&width=300"
                      }
                      alt={project.title}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                  </div>
                </CardItem>

                <CardItem
                  translateZ="50"
                  className="text-xl font-bold mt-6 text-white group-hover/card:text-cyan-400 transition-colors duration-300"
                >
                  {project.title}
                </CardItem>

                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm mt-2 dark:text-neutral-300"
                >
                  {project.description}
                </CardItem>

                <CardItem translateZ="40" className="flex flex-wrap gap-2 mt-4">
                  {project.technologies.slice(0, 3).map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition-colors"
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
                </CardItem>

                <div className="flex justify-between items-center mt-8">
                  <CardItem translateZ={30}>
                    <Button
                      asChild
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
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
                  </CardItem>
                  {project.github && (
                    <CardItem translateZ={30}>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-pink-500 text-pink-400 hover:bg-pink-500/10 transition-colors"
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
                    </CardItem>
                  )}
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
