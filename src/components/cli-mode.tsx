"use client";

import type React from "react";
import { useState, useEffect, useMemo, useReducer, useRef } from "react";
import { useMode } from "@/components/mode-provider";
import { Button } from "@/components/ui/button";
import { ChevronUp, Copy, Minus, Monitor, Square, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fetchProgrammingJoke } from "@/lib/programmingJokes";
import { BlogBuffer } from "@/components/cli/blog-buffer";
import { blogRows } from "@/components/cli/blog-buffer-utils";
import { availableCommands, completeCommand, windowReducer } from "@/components/cli/terminal-utils";
import { isListedProject } from "@/lib/blog/projects";

export function CliMode() {
  const { portfolioData, cliData, posts, setCurrentMode } = useMode();
  const [blogOpen, setBlogOpen] = useState(false);
  const listedProjects = portfolioData.projects.filter(isListedProject);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandResult[]>([
    { command: "", output: cliData.welcome },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLButtonElement>(null);
  const [windowState, dispatchWindow] = useReducer(windowReducer, { mode: "normal", restoreTo: "normal" });
  const commands = useMemo(() => availableCommands(cliData), [cliData]);
  const reduceMotion = useReducedMotion();

  // Keep focus where the user can act: on the dock while minimized, back in the terminal on restore.
  useEffect(() => {
    if (windowState.mode === "minimized") dockRef.current?.focus();
    else if (!blogOpen) inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowState.mode]);

  interface CommandResult {
    command: string;
    output: string;
    isError?: boolean;
    isLoading?: boolean;
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    inputRef.current?.focus();
  }, [history]);

  const simulateLoading = (command: string) => {
    const loadingMessages = {
      "/about": cliData.loading.about,
      "/projects": cliData.loading.projects,
      "/skills": cliData.loading.skills,
      "/contact": cliData.loading.contact,
      "/resume": cliData.loading.resume,
    };

    const loadingMessage =
      loadingMessages[command as keyof typeof loadingMessages];

    // Only show loading for specific commands that have loading messages
    if (loadingMessage) {
      setHistory((prev) => [
        ...prev,
        { command, output: loadingMessage, isLoading: true },
      ]);
      setIsProcessing(true);
      return new Promise((resolve) => setTimeout(resolve, 600));
    }

    // For other commands, don't show loading
    return Promise.resolve();
  };

  // Custom function handler
  const executeCustomFunction = async (command: string) => {
    if (!cliData.customFunctions) return false;

    const functionName = command.substring(1); // Remove the leading slash
    const customFunction = cliData.customFunctions[functionName];

    if (customFunction) {
      await simulateLoading(command);

      let output = "";
      let isError = false;

      try {
        // Execute the function based on its type
        if (customFunction.type === "text") {
          output = customFunction.content;
        } else if (customFunction.type === "random") {
          const randomIndex = Math.floor(
            Math.random() * customFunction.options.length
          );
          output = customFunction.options[randomIndex];
        } else if (customFunction.type === "ascii") {
          output = customFunction.art;
        } else if (customFunction.type === "joke") {
          const jokeFunction = await fetchProgrammingJoke();
          output = `${jokeFunction.setup}\n\n${jokeFunction.punchline}`;
        }
      } catch (error) {
        output = `Error executing command: ${error}`;
        isError = true;
      }

      setHistory((prev) => {
        const newHistory = [...prev];
        // Only remove loading message if it exists
        if (isProcessing) {
          newHistory.pop();
        }
        return [...newHistory, { command, output, isError }];
      });

      setIsProcessing(false);
      setInput("");
      return true;
    }

    return false;
  };

  const handleCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    let output = "";
    let isError = false;

    // Update command history
    if (command) {
      setCommandHistory((prev) => [command, ...prev]);
      setHistoryIndex(-1);
    }

    // Process commands
    if (command === "") {
      return;
    } else if (await executeCustomFunction(command)) {
      // Custom function was executed
      return;
    } else if (command === "/help") {
      output = cliData.help;
    } else if (command === "/clear") {
      setHistory([]);
      setInput("");
      setIsProcessing(false);
      return;
    } else if (command === "/gui") {
      setCurrentMode("gui");
      return;
    } else if (command === "/about") {
      await simulateLoading(command);
      output = portfolioData.about.summary;
    } else if (command === "/projects") {
      await simulateLoading(command);
      output = listedProjects
        .map(
          (project: any, index: number) =>
            `${index + 1}. ${project.title} - ${project.description}\n`
        )
        .join("");
    } else if (command.startsWith("/project ")) {
      const projectIndex = Number.parseInt(command.split(" ")[1]) - 1;
      output = listedProjects[projectIndex]
        ? `Title: ${listedProjects[projectIndex].title}\nDescription: ${
            listedProjects[projectIndex].description
          }\nTechnologies: ${listedProjects[
            projectIndex
          ].technologies.join(
            ", "
          )}\nLink: ${listedProjects[projectIndex].link}`
        : "Project not found. Use '/projects' to see available projects.";
      isError = !listedProjects[projectIndex];
    } else if (command === "/skills") {
      await simulateLoading(command);
      output = Object.entries(portfolioData.skills)
        .map(
          ([category, skills]: [string, any]) =>
            `${category}:\n${skills.join(", ")}\n`
        )
        .join("\n");
    } else if (command === "/contact") {
      await simulateLoading(command);
      output = Object.entries(portfolioData.contact)
        .map(([method, value]: [string, any]) => `${method}: ${value}`)
        .join("\n");
    } else if (command === "/blog") {
      if (posts.length === 0) {
        output = "No articles yet.";
      } else {
        setHistory((prev) => [...prev, { command, output: "" }]);
        setInput("");
        setBlogOpen(true);
        return;
      }
    } else if (command.startsWith("/blog ")) {
      const line = Number.parseInt(command.split(" ")[1], 10);
      const row = blogRows(posts)[line - 1];
      if (row) {
        output = `Opening ${row.post.title}...`;
        window.location.href = `/blog/${row.post.slug}/`;
      } else {
        output = "Article not found. Use '/blog' to see available articles.";
        isError = true;
      }
    } else if (command === "/resume") {
      await simulateLoading(command);
      window.open("/resume/", "_blank");
    } else {
      output = `Command not found: ${command}. Type '/help' for available commands.`;
      isError = true;
    }

    // Update history with the output
    setHistory((prev) => {
      const newHistory = [...prev];
      // Only remove loading message if we had shown one
      if (isProcessing) {
        newHistory.pop();
      }
      return [...newHistory, { command, output, isError }];
    });

    setIsProcessing(false);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!isProcessing) {
        handleCommand(input);
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      const { value, matches } = completeCommand(input, commands);
      // Nothing to complete: let Tab move focus normally (no keyboard trap).
      if (matches.length === 0) return;
      e.preventDefault();
      setInput(value);
      if (matches.length > 1) {
        setHistory((prev) => [...prev, { command: input, output: matches.join("   ") }]);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setHistory([]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const minimized = windowState.mode === "minimized";
  const maximized = windowState.mode === "maximized";
  const closeToGui = () => setCurrentMode("gui");
  const focusTerminal = () => {
    if (!blogOpen && !window.getSelection()?.toString()) inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        layout={!reduceMotion}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
        hidden={minimized}
        className={`flex w-full h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl shadow-pink-500/5 ${
          maximized ? "md:h-[88vh] md:w-[90vw]" : "md:h-[65vh] md:w-[60vw] md:min-w-[640px] md:max-w-[1100px]"
        }`}
      >
        {/* Title bar — double-click toggles maximize, like a desktop window */}
        <div
          className="flex select-none items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2"
          onDoubleClick={() => dispatchWindow("toggleMaximize")}
        >
          {/* Mouse shortcuts; the labelled buttons on the right are the accessible controls */}
          <div className="flex items-center gap-2" aria-hidden="true">
            <button tabIndex={-1} onClick={closeToGui} className="h-3 w-3 rounded-full bg-red-500 hover:brightness-125" />
            <button tabIndex={-1} onClick={() => dispatchWindow("minimize")} className="h-3 w-3 rounded-full bg-yellow-500 hover:brightness-125" />
            <button tabIndex={-1} onClick={() => dispatchWindow("toggleMaximize")} className="hidden h-3 w-3 rounded-full bg-green-500 hover:brightness-125 md:block" />
          </div>
          <div className="font-mono text-xs text-zinc-400">zero@portfolio: ~</div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
              onClick={() => dispatchWindow("minimize")}
              aria-label="Minimize terminal"
              title="Minimize"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-7 w-7 text-zinc-400 hover:text-zinc-100 md:inline-flex"
              onClick={() => dispatchWindow("toggleMaximize")}
              aria-label={maximized ? "Restore terminal size" : "Maximize terminal"}
              title={maximized ? "Restore" : "Maximize"}
            >
              {maximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
              onClick={closeToGui}
              aria-label="Close terminal and switch to GUI mode"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Terminal content */}
        <div
          ref={terminalRef}
          onClick={focusTerminal}
          className="min-h-0 flex-1 overflow-auto bg-black p-4 font-mono text-[15px] leading-relaxed text-zinc-300 md:p-5"
        >
          {blogOpen ? (
            <BlogBuffer
              posts={posts}
              onClose={() => {
                setBlogOpen(false);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            />
          ) : (
            <>
              {history.map((item, index) => (
                <div key={index} className="mb-3">
                  {item.command && (
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <Prompt />
                      <span className="text-zinc-100">{item.command}</span>
                    </div>
                  )}
                  <div
                    className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${
                      item.isError ? "text-red-400" : item.isLoading ? "text-cyan-400" : "text-zinc-300"
                    }`}
                  >
                    {item.isLoading ? (
                      <div className="flex items-center gap-1">
                        <span>{item.output}</span>
                        <span className="inline-flex">
                          <span className="animate-[blink_1s_infinite_0ms]">.</span>
                          <span className="animate-[blink_1s_infinite_200ms]">
                            .
                          </span>
                          <span className="animate-[blink_1s_infinite_400ms]">
                            .
                          </span>
                        </span>
                      </div>
                    ) : (
                      item.output
                    )}
                  </div>
                </div>
              ))}

              {/* Input line */}
              <div className="flex flex-wrap items-baseline gap-x-2">
                <Prompt />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Terminal command"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="min-w-[8ch] flex-1 border-none bg-transparent font-mono text-zinc-100 caret-pink-400 outline-none placeholder:text-zinc-600"
                  autoFocus
                  disabled={isProcessing}
                  placeholder={isProcessing ? "Processing..." : "Type a command..."}
                />
              </div>
            </>
          )}
        </div>

        {!blogOpen && (
          <p className="hidden border-t border-zinc-800 bg-zinc-950 px-4 py-1.5 font-mono text-xs text-zinc-500 sm:block">
            Tab complete · ↑↓ history · Ctrl+L clear · /help for commands
          </p>
        )}
      </motion.div>

      {minimized && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center">
          <motion.button
            ref={dockRef}
            type="button"
            initial={{ y: reduceMotion ? 0 : 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={() => dispatchWindow("restore")}
            aria-label="Restore terminal"
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-sm text-zinc-200 shadow-lg shadow-pink-500/10 hover:border-pink-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ChevronUp className="h-4 w-4 text-pink-400" aria-hidden="true" />
            zero — terminal
          </motion.button>
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        // Hidden on phones: the full-screen window's ✕ already switches to GUI, and this would cover it.
        className="fixed top-4 right-4 hidden border-pink-500 text-pink-500 hover:bg-pink-500/10 md:inline-flex"
        onClick={closeToGui}
        title="Switch to GUI Mode"
        aria-label="Switch to GUI mode"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Prompt() {
  return (
    <span className="shrink-0">
      <span className="text-pink-400">zero@portfolio</span>
      <span className="text-zinc-500">:</span>
      <span className="text-cyan-400">~</span>
      <span className="text-zinc-500">$</span>
    </span>
  );
}
