"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Trash2,
  Minimize2,
  Send,
  Square,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAssistant } from "../assistant-provider";
import { useAssistantStore } from "../use-assistant-store";
import { MessageBubble } from "./message-bubble";

export const SpeedDialAssistant: React.FC = () => {
  const pathname = usePathname();
  const isCreateRoute =
    pathname === "/question-papers/create" ||
    pathname === "/question-paper/create" ||
    pathname?.startsWith("/question-papers/create") ||
    pathname?.startsWith("/question-paper/create");

  const {
    isOpen,
    setIsOpen,
    messages,
    sendMessage,
    clearMessages,
    stop,
    isLoading,
    error,
  } = useAssistant();
  const { activePaperId } = useAssistantStore();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when new messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when chat window is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl + K / Cmd + K to toggle assistant
  useEffect(() => {
    if (!isCreateRoute) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen, isCreateRoute]);

  // Only show the chatbot on /question-papers/create route
  if (!isCreateRoute) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const quickPrompts = [
    "দশম শ্রেণির পদার্থবিজ্ঞান অর্ধ-বার্ষিক পরীক্ষার প্রশ্নপত্র তৈরি করো",
    "নবম শ্রেণির সাধারণ গণিত বার্ষিক পরীক্ষার প্রশ্নপত্র তৈরি করো",
    "বাংলা ১ম ও ২য় পত্র সমন্বিত পরীক্ষার প্রশ্নপত্র তৈরি করো",
  ];

  return (
    <>
      {/* ── FLOATING CHAT CARD (SMOOTH SCALE & OPACITY TRANSITION) ────── */}
      <aside
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[460px] h-[640px] max-h-[85vh]",
          "backdrop-blur-xl bg-card/95 border border-border/80",
          "shadow-2xl rounded-3xl flex flex-col overflow-hidden font-sans origin-bottom-right",
          "transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none select-none"
        )}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm text-foreground leading-tight">
                  শিখনারী এআই সহকারী
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                  স্মার্ট ক্রিয়েটর
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                প্রশ্নপত্র স্বয়ংক্রিয়করণ সহকারী
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearMessages}
                className="w-8 h-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                title="চ্যাট সাফ করুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="মিনিমাইজ"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.length === 0 && (
            <div className="space-y-4 my-2">
              {/* Intro Hero Badge */}
              <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/2 to-transparent p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-600 text-primary-foreground mx-auto flex items-center justify-center shadow-md shadow-primary/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs text-foreground">
                  শিখনারী প্রশ্নপত্র নির্মাতা সহকারী
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  শ্রেণি, বিষয়, পরীক্ষার নাম ও সময় বলুন — আমি তাৎক্ষণিক প্রশ্নের নম্বর বণ্টন ও ব্লুপ্রিন্ট তৈরি করে দেব।
                </p>
              </div>

              {/* Initial Assistant Bengali Greeting Message Bubble */}
              <div className="flex gap-2.5 text-xs font-sans flex-row animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs bg-gradient-to-tr from-primary to-emerald-600 text-primary-foreground">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col gap-1.5 max-w-[85%] items-start">
                  <div className="p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-xs bg-card border text-card-foreground">
                    <p className="font-medium">
                      আসসালামু আলাইকুম! নতুন প্রশ্নপত্র তৈরি করতে আপনার শ্রেণি, বিষয়, পরীক্ষার নাম ও সময় জানিয়ে দিন।
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    সহকারী • প্রস্তুত
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Render All Messages via MessageBubble */}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                একটি সমস্যা দেখা দিয়েছে
              </p>
              <p className="opacity-90 leading-relaxed text-[11px]">{error.message}</p>
            </div>
          )}
        </div>

        {/* Dynamic Quick Prompt Chips (Horizontal) */}
        <div className="px-3.5 py-2 bg-muted/30 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage({ text: p })}
              disabled={isLoading}
              className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-background hover:bg-muted text-foreground/80 border text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <div className="p-3 bg-card border-t border-border shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 bg-muted/60 rounded-2xl px-2.5 py-1.5 border border-border focus-within:border-primary focus-within:bg-background transition-all shadow-inner">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="যেমন: দশম শ্রেণির পদার্থবিজ্ঞান অর্ধ-বার্ষিক পরীক্ষা..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-foreground text-xs placeholder:text-muted-foreground focus:outline-none px-1"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="w-7 h-7 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                title="থামুন"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-7 h-7 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:opacity-95 text-primary-foreground flex items-center justify-center transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="পাঠান"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10px] text-muted-foreground">
            <span>
              শর্টকাট: <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-foreground/80">Ctrl + K</kbd>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              এআই সংযুক্ত
            </span>
          </div>
        </div>
      </aside>

      {/* ── FLOATING TRIGGER FAB (SMOOTH SCALE & OPACITY TRANSITION) ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 md:bottom-6 right-5 md:right-6 z-50 w-14 h-14 rounded-full text-primary-foreground shadow-xl shadow-primary/25",
          "bg-gradient-to-tr from-primary to-emerald-600",
          "flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer",
          "ring-4 ring-primary/15 origin-bottom-right transition-all duration-300 ease-out",
          !isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-75 translate-y-2 pointer-events-none select-none"
        )}
        title="শিখনারী এআই সহকারী (Ctrl + K)"
        aria-label="শিখনারী এআই সহকারী"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>
    </>
  );
};
