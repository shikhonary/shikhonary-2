"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Trash2,
  Minimize2,
  X,
  Send,
  Square,
  AlertTriangle,
  Check,
  Bot,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useAssistant } from "../assistant-provider";
import { useAssistantStore } from "../use-assistant-store";

export const SpeedDialAssistant: React.FC = () => {
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
  }, [messages]);

  // Focus input when chat window is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl + K / Cmd + K to toggle assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const quickPrompts = activePaperId
    ? [
        "⚡ বাকি প্রশ্নগুলো পূরণ করো",
        "📐 ২ কলামে সাজাও",
        "📄 OMR শিট যুক্ত করো",
        "📑 সেট ক ও খ তৈরি করো",
      ]
    : [
        "দশম শ্রেণির পদার্থবিজ্ঞান প্রশ্নপত্র তৈরি করো",
        "নবম শ্রেণির সাধারণ গণিত প্রশ্নপত্র তৈরি করো",
        "আমার প্রশ্নপত্রের তালিকা দেখাও",
      ];

  return (
    <>
      {/* ── FLOATING CHAT CARD (SMOOTH SCALE & OPACITY TRANSITION) ────── */}
      <aside
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[430px] h-[620px] max-h-[85vh]",
          "backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800",
          "shadow-2xl rounded-3xl flex flex-col overflow-hidden font-sans origin-bottom-right",
          "transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none select-none"
        )}
        aria-hidden={!isOpen}
      >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-500/10 via-indigo-500/5 to-white/60 dark:to-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    শিখনারী এআই সহকারী
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  {activePaperId ? "প্রশ্নপত্র বিল্ডার সক্রিয়" : "প্রশ্নপত্র স্বয়ংক্রিয়করণ সহকারী"}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearMessages}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="চ্যাট সাফ করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-emerald-500/5 via-indigo-500/5 to-transparent p-3.5 text-center space-y-1.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    শিখনারী এআই সহকারী
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    {activePaperId
                      ? "প্রশ্নপত্র বিল্ডার সক্রিয় — প্রশ্ন পূরণ, বিন্যাস ও সেট তৈরিতে সাহায্য করতে প্রস্তুত।"
                      : "স্মার্ট প্রশ্নপত্র স্বয়ংক্রিয়করণ সহকারী — নতুন পরীক্ষা বা মডেল টেস্ট তৈরি করুন।"}
                  </p>
                </div>

                {/* Initial Assistant Bengali Greeting Message Bubble */}
                <div className="flex gap-2.5 text-xs font-sans flex-row animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-[85%] items-start">
                    <div className="p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-xs bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-100">
                      <p className="font-medium">
                        {activePaperId
                          ? "আসসালামু আলাইকুম! আমি আপনার শিখনারী এআই সহকারী। আপনার বর্তমান প্রশ্নপত্রটিতে প্রশ্ন পূরণ, অদলবদল বা কলাম বিন্যাস সাজাতে কীভাবে সাহায্য করতে পারি?"
                          : "আসসালামু আলাইকুম! আমি আপনার শিখনারী এআই সহকারী। নতুন কোনো প্রশ্নপত্র তৈরি বা পূর্বের প্রশ্নপত্র সম্পাদনায় কীভাবে সাহায্য করতে পারি?"}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 px-1">
                      সহকারী • প্রস্তুত
                    </span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              const toolParts = (Array.isArray(m.parts) ? m.parts : []).filter(
                (p: any) =>
                  p.type === "dynamic-tool" ||
                  (typeof p.type === "string" && p.type.startsWith("tool-"))
              );

              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2.5 text-xs font-sans",
                    isAssistant ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs",
                      isAssistant
                        ? "bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    )}
                  >
                    {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[85%]",
                      isAssistant ? "items-start" : "items-end"
                    )}
                  >
                    {/* Tool Badges */}
                    {toolParts.length > 0 && (
                      <div className="flex flex-col gap-1 my-0.5">
                        {toolParts.map((tool: any, idx: number) => {
                          const name = tool.toolName || tool.type?.replace("tool-", "");
                          const isRunning =
                            tool.state === "input-streaming" || tool.state === "call";
                          const isDone = tool.state === "output-available";

                          let label = "কার্যক্রম সম্পন্ন হচ্ছে...";
                          if (name === "createPaper" || name === "createPaperSmart") label = isRunning ? "প্রশ্নপত্র তৈরি হচ্ছে..." : "প্রশ্নপত্র তৈরি হয়েছে";
                          else if (name === "autoFillDistribution") label = isRunning ? "প্রশ্ন বাছাই হচ্ছে..." : "প্রশ্নপত্র ক্যানভাসে যুক্ত হয়েছে";
                          else if (name === "replaceQuestion") label = isRunning ? "প্রশ্ন প্রতিস্থাপন হচ্ছে..." : "প্রশ্ন পরিবর্তন সম্পন্ন";
                          else if (name === "generatePaperSets") label = isRunning ? "সেট তৈরি হচ্ছে..." : "প্রশ্ন সেট তৈরি হয়েছে";
                          else if (name === "updatePaperSettings") label = isRunning ? "লেআউট আপডেট হচ্ছে..." : "লেআউট সংরক্ষিত হয়েছে";

                          return (
                            <div key={idx} className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-2 py-0.5 flex items-center gap-1 font-normal rounded-lg w-fit",
                                  isDone && "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                )}
                              >
                                {isRunning ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                )}
                                <span>{label}</span>
                              </Badge>

                              {/* Interactive Guardrail Approval Card */}
                              {tool.output?.needsApproval && (
                                <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 space-y-2 shadow-xs text-xs">
                                  <div className="flex items-start gap-1.5 text-amber-900 dark:text-amber-200">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="font-medium leading-snug">
                                      {tool.output.actionSummary || tool.output.message}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <Button
                                      size="sm"
                                      disabled={isLoading}
                                      onClick={() => sendMessage({ text: "হ্যাঁ, অনুমোদন করছি। সম্পন্ন করুন।" })}
                                      className="h-6 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-2.5 gap-1 rounded-lg"
                                    >
                                      <Check className="w-3 h-3" />
                                      অনুমোদন করুন
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isLoading}
                                      onClick={() => sendMessage({ text: "না, বাতিল করুন।" })}
                                      className="h-6 text-[11px] cursor-pointer px-2.5 gap-1 rounded-lg border-amber-300 dark:border-amber-800"
                                    >
                                      <X className="w-3 h-3" />
                                      বাতিল
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Text Content */}
                    {Array.isArray(m.parts) ? (
                      m.parts.map((part: any, pIdx: number) => {
                        if (part.type === "text" && part.text?.trim()) {
                          return (
                            <div
                              key={pIdx}
                              className={cn(
                                "rounded-2xl px-3.5 py-2 leading-relaxed whitespace-pre-wrap break-words shadow-xs text-xs",
                                isAssistant
                                  ? "bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-100 rounded-tl-none border border-slate-200/60 dark:border-zinc-700/60"
                                  : "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-medium rounded-tr-none"
                              )}
                            >
                              {part.text}
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2 leading-relaxed whitespace-pre-wrap break-words shadow-xs text-xs",
                          isAssistant
                            ? "bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-100 rounded-tl-none border border-slate-200/60 dark:border-zinc-700/60"
                            : "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-medium rounded-tr-none"
                        )}
                      >
                        {(m as any).content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
          <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-zinc-900/80 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage({ text: p.replace(/^[^\s]+\s/, "") })}
                disabled={isLoading}
                className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Composer */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800 shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 bg-slate-100/90 dark:bg-zinc-800/90 rounded-2xl px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="প্রশ্নপত্র বা বিন্যাস পরিবর্তন নিয়ে নির্দেশ দিন..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-slate-800 dark:text-zinc-100 text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none px-1"
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
                  className="w-7 h-7 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-95 text-white flex items-center justify-center transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  title="পাঠান"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10px] text-slate-400 dark:text-zinc-500">
              <span>
                শর্টকাট: <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-slate-600 dark:text-zinc-400">Ctrl + K</kbd>
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
            "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white shadow-xl shadow-emerald-500/25",
            "bg-gradient-to-tr from-emerald-500 to-indigo-600",
            "flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer",
            "ring-4 ring-emerald-500/15 origin-bottom-right transition-all duration-300 ease-out",
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
