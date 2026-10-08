"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { useAssistant } from "../assistant-provider";
import { useAssistantStore } from "../use-assistant-store";

const GLOBAL_PROMPTS = [
  "দশম শ্রেণির পদার্থবিজ্ঞান অর্ধ-বার্ষিক পরীক্ষার প্রশ্নপত্র তৈরি করো",
  "নবম শ্রেণির গণিত ৫০ নম্বরের একটি প্রশ্নপত্র বানাও",
  "আমার বর্তমান প্রশ্নপত্রগুলোর তালিকা দেখাও",
];

const BUILDER_PROMPTS = [
  "বাকি প্রশ্নগুলো স্বয়ংক্রিয়ভাবে পূরণ করো",
  "প্রশ্নপত্রটি ২ কলামে সাজাও",
  "মার্জিন কিছুটা ছোট করো",
  "ক এবং খ দুটি সেট তৈরি করো",
  "একটি OMR উত্তরপত্র শিট যুক্ত করো",
];

export const Composer: React.FC = () => {
  const { sendMessage, stop, isLoading, messages } = useAssistant();
  const { activePaperId } = useAssistantStore();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePrompts = activePaperId ? BUILDER_PROMPTS : GLOBAL_PROMPTS;

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-t bg-background shrink-0">
      {/* Quick Prompts (Only show if message list is small) */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {activePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrompt(p)}
              disabled={isLoading}
              className="text-xs text-left px-2.5 py-1.5 rounded-lg border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5 leading-snug"
            >
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="প্রশ্নপত্র সম্পর্কিত যেকোনো অনুরোধ লিখুন... (Enter দিয়ে পাঠান)"
          rows={1}
          disabled={isLoading}
          className="min-h-[44px] max-h-32 resize-none text-sm py-2.5 px-3 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
        />

        {isLoading ? (
          <Button
            type="button"
            onClick={stop}
            size="icon"
            variant="destructive"
            className="w-10 h-10 rounded-xl shrink-0 cursor-pointer"
            aria-label="থামুন"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!input.trim()}
            size="icon"
            className="w-10 h-10 rounded-xl shrink-0 cursor-pointer bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label="পাঠান"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
};
