export const MODE_STORAGE_KEY = "zerro-mode";
export const MODES = ["select", "gui", "cli"] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: string | null): value is Mode => MODES.includes(value as Mode);

/** Back/forward restores the last mode (e.g. returning from an article); everything else starts at the selector. */
export function resolveInitialMode(navigationType: string | undefined, stored: string | null): Mode {
  if (navigationType !== "back_forward") return "select";
  return isMode(stored) ? stored : "select";
}
