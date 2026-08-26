"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const AiCopilotPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI Copilot. I can help you generate an entire question paper in seconds. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Mock AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I have generated the question paper based on your prompt and added it to the canvas. (This is a mock UI for now!)",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex items-center gap-2 p-4 border-b bg-muted/20">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI Copilot</h3>
          <p className="text-xs text-muted-foreground">Powered by Gemini</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 text-sm",
                message.role === "assistant" ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  message.role === "assistant"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.role === "assistant" ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 max-w-[85%]",
                  message.role === "assistant"
                    ? "bg-muted/50 border text-foreground"
                    : "bg-primary text-primary-foreground shadow-sm"
                )}
              >
                <p className="leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-muted/50 border flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center overflow-hidden rounded-full border bg-muted/50 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g. Create a 50-mark physics paper..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 pl-5 pr-12 h-12 text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="absolute right-1 w-10 h-10 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
