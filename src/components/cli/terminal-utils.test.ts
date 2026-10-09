import { describe, expect, it } from "vitest";
import { availableCommands, completeCommand, windowReducer, type WindowState } from "./terminal-utils";

const commands = ["/blog", "/clear", "/contact", "/gui", "/help", "/project", "/projects"];

describe("availableCommands", () => {
  it("lists built-in and custom commands with a leading slash, sorted", () => {
    expect(availableCommands({ commands: { help: {}, blog: {} }, customFunctions: { joke: {} } })).toEqual([
      "/blog",
      "/help",
      "/joke",
    ]);
  });

  it("works without custom functions", () => {
    expect(availableCommands({ commands: { gui: {} } })).toEqual(["/gui"]);
  });
});

describe("completeCommand", () => {
  it("completes a unique prefix", () => {
    expect(completeCommand("/bl", commands)).toEqual({ value: "/blog", matches: ["/blog"] });
  });

  it("extends to the longest common prefix and lists every match", () => {
    expect(completeCommand("/c", commands)).toEqual({ value: "/c", matches: ["/clear", "/contact"] });
    expect(completeCommand("/pro", commands)).toEqual({ value: "/project", matches: ["/project", "/projects"] });
  });

  it("is case-insensitive like the command parser", () => {
    expect(completeCommand("/GU", commands)).toEqual({ value: "/gui", matches: ["/gui"] });
  });

  it("leaves input alone when nothing matches, it has arguments, or it isn't a command", () => {
    expect(completeCommand("/zzz", commands)).toEqual({ value: "/zzz", matches: [] });
    expect(completeCommand("/blog 2", commands)).toEqual({ value: "/blog 2", matches: [] });
    expect(completeCommand("hello", commands)).toEqual({ value: "hello", matches: [] });
    expect(completeCommand("", commands)).toEqual({ value: "", matches: [] });
  });
});

describe("windowReducer", () => {
  const normal: WindowState = { mode: "normal", restoreTo: "normal" };

  it("toggles maximize", () => {
    const max = windowReducer(normal, "toggleMaximize");
    expect(max).toEqual({ mode: "maximized", restoreTo: "maximized" });
    expect(windowReducer(max, "toggleMaximize")).toEqual(normal);
  });

  it("minimizes and restores to the previous size", () => {
    const max = windowReducer(normal, "toggleMaximize");
    const min = windowReducer(max, "minimize");
    expect(min).toEqual({ mode: "minimized", restoreTo: "maximized" });
    expect(windowReducer(min, "restore")).toEqual({ mode: "maximized", restoreTo: "maximized" });
  });

  it("maximizing from the dock opens maximized", () => {
    const min = windowReducer(normal, "minimize");
    expect(windowReducer(min, "toggleMaximize")).toEqual({ mode: "maximized", restoreTo: "maximized" });
  });

  it("restore is a no-op when the window is open", () => {
    expect(windowReducer(normal, "restore")).toBe(normal);
  });
});
