import content from "@/constants/content.json";

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  github?: string;
  /** false = blog-only: usable by articles, hidden from the homepage Projects section and CLI /projects. */
  listed?: boolean;
}

export const PROJECTS: Project[] = content.projects;
export const PROJECT_IDS: string[] = PROJECTS.map((project) => project.id);

export function getProject(id: string | undefined): Project | undefined {
  return id ? PROJECTS.find((project) => project.id === id) : undefined;
}

export function isListedProject(project: { listed?: boolean }): boolean {
  return project.listed !== false;
}
