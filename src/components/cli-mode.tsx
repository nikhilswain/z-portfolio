import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useMode } from "@/components/mode-provider"
import { Button } from "@/components/ui/button"
import { Monitor, X, Minus, Square } from "lucide-react"
import { motion } from "framer-motion"

interface CommandResult {
  command: string
  output: string
  isError?: boolean
  isLoading?: boolean
}

export function CliMode() {
  const { portfolioData, cliData, setCurrentMode } = useMode()
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<CommandResult[]>([{ command: "", output: cliData.welcome }])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
    inputRef.current?.focus()
  }, [history])

  const simulateLoading = (command: string) => {
    const loadingMessages = {
      "/about": cliData.loading.about,
      "/projects": cliData.loading.projects,
      "/skills": cliData.loading.skills,
    }

    const loadingMessage = loadingMessages[command as keyof typeof loadingMessages] || "Processing..."

    setHistory((prev) => [...prev, { command, output: loadingMessage, isLoading: true }])
    setIsProcessing(true)

    // Simulate processing time
    return new Promise((resolve) => setTimeout(resolve, 1200))
  }

  // Custom function handler
  const executeCustomFunction = async (command: string) => {
    if (!cliData.customFunctions) return false

    const functionName = command.substring(1) // Remove the leading slash
    const customFunction = cliData.customFunctions[functionName]

    if (customFunction) {
      await simulateLoading(command)

      let output = ""
      let isError = false

      try {
        // Execute the function based on its type
        if (customFunction.type === "text") {
          output = customFunction.content
        } else if (customFunction.type === "random") {
          const randomIndex = Math.floor(Math.random() * customFunction.options.length)
          output = customFunction.options[randomIndex]
        } else if (customFunction.type === "ascii") {
          output = customFunction.art
        } else if (customFunction.type === "joke") {
          output = `${customFunction.setup}\n\n${customFunction.punchline}`
        }
      } catch (error) {
        output = `Error executing command: ${error}`
        isError = true
      }

      setHistory((prev) => {
        const newHistory = [...prev]
        if (isProcessing) {
          newHistory.pop() // Remove loading message
        }
        return [...newHistory, { command, output, isError }]
      })

      setIsProcessing(false)
      setInput("")
      return true
    }

    return false
  }

  const handleCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase()
    let output = ""
    let isError = false

    // Update command history
    if (command) {
      setCommandHistory((prev) => [command, ...prev])
      setHistoryIndex(-1)
    }

    // Process commands
    if (command === "") {
      return
    } else if (await executeCustomFunction(command)) {
      // Custom function was executed
      return
    } else if (command === "/help") {
      await simulateLoading(command)
      output = cliData.help
    } else if (command === "/clear") {
      setHistory([])
      setInput("")
      setIsProcessing(false)
      return
    } else if (command === "/gui") {
      setCurrentMode("gui")
      return
    } else if (command === "/about") {
      await simulateLoading(command)
      output = portfolioData.about.summary
    } else if (command === "/projects") {
      await simulateLoading(command)
      output = portfolioData.projects
        .map((project: any, index: number) => `${index + 1}. ${project.title} - ${project.description}\n`)
        .join("")
    } else if (command.startsWith("/project ")) {
      const projectIndex = Number.parseInt(command.split(" ")[1]) - 1
      await simulateLoading(command)
      if (portfolioData.projects[projectIndex]) {
        const project = portfolioData.projects[projectIndex]
        output = `Title: ${project.title}\nDescription: ${project.description}\nTechnologies: ${project.technologies.join(", ")}\nLink: ${project.link}`
      } else {
        output = "Project not found. Use '/projects' to see available projects."
        isError = true
      }
    } else if (command === "/skills") {
      await simulateLoading(command)
      output = Object.entries(portfolioData.skills)
        .map(([category, skills]: [string, any]) => `${category}:\n${skills.join(", ")}\n`)
        .join("\n")
    } else if (command === "/contact") {
      await simulateLoading(command)
      output = Object.entries(portfolioData.contact)
        .map(([method, value]: [string, any]) => `${method}: ${value}`)
        .join("\n")
    } else {
      output = `Command not found: ${command}. Type '/help' for available commands.`
      isError = true
    }

    // Remove loading message and add actual output
    setHistory((prev) => {
      const newHistory = [...prev]
      if (isProcessing) {
        // Replace the loading message with the actual output
        newHistory.pop()
      }
      return [...newHistory, { command, output, isError }]
    })

    setIsProcessing(false)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!isProcessing) {
        handleCommand(input)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl h-[70vh] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 shadow-xl shadow-pink-500/5"
      >
        {/* Terminal header */}
        <div className="bg-zinc-800 px-4 py-2 flex justify-between items-center border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-zinc-400 font-mono">{portfolioData.name} - Terminal</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-200">
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-200">
              <Square className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
              onClick={() => setCurrentMode("gui")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Terminal content */}
        <div
          ref={terminalRef}
          className="h-[calc(70vh-32px)] overflow-auto p-4 font-mono text-cyan-500 text-sm bg-black"
        >
          {history.map((item, index) => (
            <div key={index} className="mb-2">
              {item.command && (
                <div className="flex items-start">
                  <span className="mr-2">$</span>
                  <span>{item.command}</span>
                </div>
              )}
              <div className={`ml-4 whitespace-pre-wrap ${item.isError ? "text-red-500" : ""}`}>
                {item.isLoading ? (
                  <div className="flex items-center gap-1">
                    <span>{item.output}</span>
                    <span className="inline-flex">
                      <span className="animate-[blink_1s_infinite_0ms]">.</span>
                      <span className="animate-[blink_1s_infinite_200ms]">.</span>
                      <span className="animate-[blink_1s_infinite_400ms]">.</span>
                    </span>
                  </div>
                ) : (
                  item.output
                )}
              </div>
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center mt-2">
            <span className="mr-2 text-pink-500">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-cyan-500 font-mono"
              autoFocus
              disabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : "Type a command..."}
            />
          </div>
        </div>
      </motion.div>

      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 border-pink-500 text-pink-500 hover:bg-pink-500/10"
        onClick={() => setCurrentMode("gui")}
        title="Switch to GUI Mode"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  )
}

