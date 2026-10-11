import type React from "react";
import { useState, useEffect, useMemo, useReducer, useRef } from "react";
import { PERSON, SKILLS, PROJECTS, EXPERIENCE, formatRange } from "@/data/profile";
import { isListedProject } from "@/lib/blog/projects";
import { fetchProgrammingJoke } from "@/lib/programmingJokes";
import type { HomepagePost } from "@/lib/blog/homepage";
import consoleText from "./console-text.json";
import { BlogBuffer } from "./blog-buffer";
import { blogRows } from "./blog-buffer-utils";
import { availableCommands, completeCommand, windowReducer } from "./terminal-utils";

interface CommandResult {
  command: string;
  output: string;
  isError?: boolean;
  isLoading?: boolean;
}

interface ConsoleProps {
  posts: HomepagePost[];
  onClose: () => void;
}

export function Console({ posts, onClose }: ConsoleProps) {
  const [blogOpen, setBlogOpen] = useState(false);
  const listedProjects = PROJECTS.filter(isListedProject);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandResult[]>([
    { command: "", output: consoleText.welcome },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLButtonElement>(null);
  const [windowState, dispatchWindow] = useReducer(windowReducer, { mode: "normal", restoreTo: "normal" });
  const commands = useMemo(() => availableCommands(consoleText), []);

  useEffect(() => {
    if (windowState.mode === "minimized") dockRef.current?.focus();
    else if (!blogOpen) inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowState.mode]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    inputRef.current?.focus();
  }, [history]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const simulateLoading = (command: string) => {
    const loadingMessages = {
      "/about": consoleText.loading.about,
      "/projects": consoleText.loading.projects,
      "/skills": consoleText.loading.skills,
      "/contact": consoleText.loading.contact,
      "/resume": consoleText.loading.resume,
    };

    const loadingMessage = loadingMessages[command as keyof typeof loadingMessages];

    if (loadingMessage) {
      setHistory((prev) => [
        ...prev,
        { command, output: loadingMessage, isLoading: true },
      ]);
      setIsProcessing(true);
      return new Promise((resolve) => setTimeout(resolve, 600));
    }

    return Promise.resolve();
  };

  const executeCustomFunction = async (command: string) => {
    if (!consoleText.customFunctions) return false;

    const functionName = command.substring(1);
    const customFunction = (consoleText.customFunctions as Record<string, any>)[functionName];

    if (customFunction) {
      await simulateLoading(command);

      let output = "";
      let isError = false;

      try {
        if (customFunction.type === "text") {
          output = customFunction.content;
        } else if (customFunction.type === "random") {
          const randomIndex = Math.floor(Math.random() * customFunction.options.length);
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

    if (command) {
      setCommandHistory((prev) => [command, ...prev]);
      setHistoryIndex(-1);
    }

    if (command === "") {
      return;
    } else if (await executeCustomFunction(command)) {
      return;
    } else if (command === "/help") {
      output = consoleText.help;
    } else if (command === "/clear") {
      setHistory([]);
      setInput("");
      setIsProcessing(false);
      return;
    } else if (command === "/gui") {
      onClose();
      return;
    } else if (command === "/about") {
      await simulateLoading(command);
      output = PERSON.summary;
    } else if (command === "/projects") {
      await simulateLoading(command);
      output = listedProjects
        .map((project, index) => `${index + 1}. ${project.title} - ${project.description}\n`)
        .join("");
    } else if (command.startsWith("/project ")) {
      const projectIndex = Number.parseInt(command.split(" ")[1]) - 1;
      const project = listedProjects[projectIndex];
      output = project
        ? `Title: ${project.title}\nDescription: ${project.description}\nTechnologies: ${project.stack.join(", ")}\nLink: ${project.link ?? project.github}`
        : "Project not found. Use '/projects' to see available projects.";
      isError = !project;
    } else if (command === "/skills") {
      await simulateLoading(command);
      output = SKILLS.map(({ group, items }) => `${group}:\n${items.join(", ")}\n`).join("\n");
    } else if (command === "/contact") {
      await simulateLoading(command);
      output = [
        `Email: ${PERSON.email}`,
        `GitHub: ${PERSON.github}`,
        `LinkedIn: ${PERSON.linkedin}`,
      ].join("\n");
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
      output = [
        ...EXPERIENCE.map(
          (job) => `${job.company} — ${job.role} (${formatRange(job.start, job.end, "Present")})`,
        ),
        "",
        `Resume PDF: ${PERSON.resumePdf}`,
      ].join("\n");
    } else {
      output = `Command not found: ${command}. Type '/help' for available commands.`;
      isError = true;
    }

    setHistory((prev) => {
      const newHistory = [...prev];
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
      if (matches.length === 0) return;
      e.preventDefault();
      setInput(value);
      if (matches.length > 1) {
        setHistory((prev) => [...prev, { command: input, output: matches.join("   ") }]);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setHistory([]);
    } else if (e.key === "Escape") {
      onClose();
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
  const focusTerminal = () => {
    if (!blogOpen && !window.getSelection()?.toString()) inputRef.current?.focus();
  };

  return (
    <div className="console" data-console>
      {!minimized && (
        <div
          className={`console__panel${open ? " console__panel--open" : ""}${maximized ? " console__panel--maximized" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Console"
        >
          <div className="console__titlebar" onDoubleClick={() => dispatchWindow("toggleMaximize")}>
            <span className="console__title">zero@portfolio: ~</span>
            <div className="console__controls">
              <button
                type="button"
                className="console__btn"
                onClick={() => dispatchWindow("minimize")}
                aria-label="Minimize terminal"
                title="Minimize"
              >
                _
              </button>
              <button
                type="button"
                className="console__btn"
                onClick={() => dispatchWindow("toggleMaximize")}
                aria-label={maximized ? "Restore terminal size" : "Maximize terminal"}
                title={maximized ? "Restore" : "Maximize"}
              >
                {maximized ? "❐" : "□"}
              </button>
              <button
                type="button"
                className="console__btn"
                onClick={onClose}
                aria-label="Close terminal"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="console__body" ref={terminalRef} onClick={focusTerminal}>
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
                  <div key={index} className="console__entry">
                    {item.command && (
                      <div className="console__command">
                        <Prompt />
                        <span>{item.command}</span>
                      </div>
                    )}
                    <div
                      className={`console__output${item.isError ? " console__output--error" : item.isLoading ? " console__output--loading" : ""}`}
                    >
                      {item.isLoading ? (
                        <span className="console__loading">
                          {item.output}
                          <span className="console__dots" aria-hidden="true">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </span>
                        </span>
                      ) : (
                        item.output
                      )}
                    </div>
                  </div>
                ))}

                <div className="console__input-line">
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
                    className="console__input"
                    autoFocus
                    disabled={isProcessing}
                    placeholder={isProcessing ? "Processing..." : "Type a command..."}
                  />
                </div>
              </>
            )}
          </div>

          {!blogOpen && (
            <p className="console__hint">
              Tab complete · ↑↓ history · Ctrl+L clear · /help for commands
            </p>
          )}
        </div>
      )}

      {minimized && (
        <div className="console__dock">
          <button
            ref={dockRef}
            type="button"
            className="console__dock-btn"
            onClick={() => dispatchWindow("restore")}
            aria-label="Restore terminal"
          >
            zero — console
          </button>
        </div>
      )}
    </div>
  );
}

function Prompt() {
  return (
    <span className="console__prompt">
      <span className="console__prompt-user">zero@portfolio</span>
      <span className="console__prompt-sep">:</span>
      <span className="console__prompt-path">~</span>
      <span className="console__prompt-sep">$</span>
    </span>
  );
}
