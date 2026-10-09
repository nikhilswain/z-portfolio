export type WindowMode = "normal" | "maximized" | "minimized";
export interface WindowState {
  mode: WindowMode;
  /** The open size to return to when restoring from the dock. */
  restoreTo: "normal" | "maximized";
}
export type WindowAction = "toggleMaximize" | "minimize" | "restore";

export function windowReducer(state: WindowState, action: WindowAction): WindowState {
  switch (action) {
    case "toggleMaximize": {
      const mode = state.mode === "maximized" ? "normal" : "maximized";
      return { mode, restoreTo: mode };
    }
    case "minimize":
      return state.mode === "minimized" ? state : { mode: "minimized", restoreTo: state.mode };
    case "restore":
      return state.mode === "minimized" ? { mode: state.restoreTo, restoreTo: state.restoreTo } : state;
  }
}

/** Every command the terminal understands, as typed (`/help`), sorted. */
export function availableCommands(cliData: { commands: Record<string, unknown>; customFunctions?: Record<string, unknown> }): string[] {
  return [...Object.keys(cliData.commands), ...Object.keys(cliData.customFunctions ?? {})]
    .map((name) => `/${name}`)
    .sort();
}

const commonPrefix = (words: string[]) =>
  words.reduce((prefix, word) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === word[i]) i++;
    return prefix.slice(0, i);
  });

/** Tab completion for the command name (not its arguments). */
export function completeCommand(input: string, commands: string[]): { value: string; matches: string[] } {
  if (!input.startsWith("/") || /\s/.test(input)) return { value: input, matches: [] };
  const typed = input.toLowerCase();
  const matches = commands.filter((command) => command.startsWith(typed));
  if (matches.length === 0) return { value: input, matches };
  return { value: commonPrefix(matches), matches };
}
