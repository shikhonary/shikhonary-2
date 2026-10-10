"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Trash2,
  X,
  Send,
  Square,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAssistant } from "@/modules/ai-assistant";
import { MessageBubble } from "@/modules/ai-assistant/client/ui/message-bubble";

interface Props {
  paperTitle?: string;
  className?: string;
  onClose?: () => void;
}

export const BuilderAiPanel: React.FC<Props> = ({ paperTitle, className, onClose }) => {
  const {
    messages,
    sendMessage,
    clearMessages,
    stop,
    isLoading,
    error,
  } = useAssistant();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when new messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const quickPrompts = [
    "৫টি বহুনির্বাচনি প্রশ্ন যোগ করো",
    "সৃজনশীল প্রশ্নের বিকল্প (অথবা) প্রশ্ন তৈরি করো",
    "প্রশ্নপত্রের কাঠিন্য ও মান যাচাই করো",
    "একটি উদ্দীপকসহ রচনামূলক প্রশ্ন তৈরি করো",
  ];

  return (
    <aside
      className={cn(
        "w-[350px] 2xl:w-[380px] border-l border-border bg-card flex flex-col h-full shrink-0 shadow-xs z-10 relative",
        className
      )}
    >
      {/* Top Header (Height h-16 to match builder header) */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-headline font-bold text-sm text-foreground truncate">
                এআই সহকারী
              </h2>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                সক্রিয়
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-body truncate">
              {paperTitle ? `প্রশ্নপত্র: ${paperTitle}` : "প্রশ্নপত্র সম্পাদক ও সহকারী"}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="size-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="চ্যাট হিস্ট্রি মুছুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-zinc-950/20 font-body">
        {messages.length === 0 && (
          <div className="space-y-4 my-2">
            {/* Intro Hero Badge */}
            <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50/70 via-indigo-50/30 to-transparent dark:from-indigo-950/40 dark:via-zinc-900/40 dark:to-transparent p-4 text-center space-y-2">
              <div className="size-9 rounded-xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-xs shadow-indigo-600/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-headline font-bold text-xs text-foreground">
                শিখনারী প্রশ্নপত্র সম্পাদক সহকারী
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                যেকোনো প্রশ্ন পরিবর্তন, নতুন প্রশ্ন যোগ, বিকল্প প্রশ্ন তৈরি বা নম্বর বণ্টন সাজাতে আমাকে নির্দেশ দিন।
              </p>
            </div>

            {/* Initial Assistant Bengali Greeting */}
            <div className="flex gap-2.5 text-xs flex-row animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="size-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs bg-indigo-600 text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col gap-1.5 max-w-[85%] items-start">
                <div className="p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-xs bg-card border border-border text-foreground">
                  <p className="font-medium">
                    আসসালামু আলাইকুম! প্রশ্নপত্র সম্পাদনায় কীভাবে সাহায্য করতে পারি? প্রশ্ন সংযোজন, বিকল্প প্রশ্ন তৈরি বা বিন্যাস পরিবর্তন করতে সরাসরি বলুন।
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
      <div className="px-3.5 py-2 bg-card border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage({ text: p })}
            disabled={isLoading}
            className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-muted/40 hover:bg-muted text-foreground/80 border border-slate-200/70 dark:border-white/10 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs font-body disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-3 bg-card border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 bg-muted/50 dark:bg-zinc-900/60 rounded-2xl px-2.5 py-1.5 border border-slate-200 dark:border-white/10 focus-within:border-indigo-500 focus-within:bg-background transition-all shadow-inner">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="যেমন: ৩ নম্বর প্রশ্নের বিকল্প প্রশ্ন তৈরি করো..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-foreground text-xs placeholder:text-muted-foreground focus:outline-none px-1 font-body"
          />

          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="size-7 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              title="থামুন"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="size-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              title="পাঠান"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10px] text-muted-foreground font-body">
          <span>
            শর্টকাট: <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-foreground/80">Ctrl + K</kbd>
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            এআই সংযুক্ত
          </span>
        </div>
      </div>
    </aside>
  );
};
