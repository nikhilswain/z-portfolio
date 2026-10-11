import { PROJECTS, type Project } from "@/data/profile";

export type { Project } from "@/data/profile";

export const PROJECT_IDS: string[] = PROJECTS.map((project) => project.id);

export function getProject(id: string | undefined): Project | undefined {
  return id ? PROJECTS.find((project) => project.id === id) : undefined;
}

export function isListedProject(project: { listed?: boolean }): boolean {
  return project.listed !== false;
}
