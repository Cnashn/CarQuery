"use client"

import type React from "react"

import { useState } from "react"
import { Send, Loader2, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Message, SearchStatus } from "./car-query-dashboard"

interface ChatPanelProps {
  messages: Message[]
  searchStatus: SearchStatus
  readyToSearch: boolean
  onSend: (message: string) => void
}

const quickChips = ["Red Honda Civic in Ottawa", "Blue BMW Z4 in Ottawa","Green Ford Mustang in Toronto"]

export function ChatPanel({ messages, searchStatus, readyToSearch, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && searchStatus !== "chatting") {
      onSend(input)
      setInput("")
    }
  }

  const handleChipClick = (chip: string) => {
    if (searchStatus !== "chatting") {
      onSend(chip)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-10 hidden lg:flex h-screen w-[360px] flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10">
          <Car className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">CarQuery Chat</h1>
          <p className="text-xs text-muted-foreground">AI-powered car search</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                message.role === "user" ? "bg-amber-400 text-zinc-950 font-semibold" : "bg-muted text-foreground",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {searchStatus === "chatting" && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Chips */}
      <div className="border-t border-border p-3">
        <p className="text-xs text-muted-foreground mb-2">Quick searches</p>
        <div className="flex flex-wrap gap-2">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              disabled={searchStatus === "chatting"}
              className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Status & Input */}
      <div className="border-t border-border p-4 space-y-3">
        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={cn("h-2 w-2 rounded-full", readyToSearch ? "bg-amber-400" : "bg-amber-600 animate-pulse")}
          />
          <span className="text-xs text-muted-foreground">{readyToSearch ? "Ready to search" : "Listening"}</span>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the car you want..."
            disabled={searchStatus === "chatting"}
            className="flex-1 bg-white text-foreground placeholder:text-muted-foreground/80 border border-amber-400 focus-visible:ring-amber-400"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || searchStatus === "chatting"}
            className="bg-amber-400 hover:bg-amber-500 text-foreground shrink-0"
          >
            {searchStatus === "chatting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </aside>
  )
}
