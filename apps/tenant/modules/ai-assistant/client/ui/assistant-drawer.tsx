"use client";

import React, { useRef, useEffect } from "react";
import { Sparkles, Trash2, Bot, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useAssistant } from "../assistant-provider";
import { MessageBubble } from "./message-bubble";
import { Composer } from "./composer";

export const AssistantDrawer: React.FC = () => {
  const { isOpen, setIsOpen, messages, clearMessages, error, isLoading } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as messages stream in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearHistory = () => {
    clearMessages();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-background border-l z-50 font-sans"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold flex items-center gap-2">
                শিখনারী এআই সহকারী
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  Llama 3.3
                </Badge>
              </SheetTitle>
              <p className="text-xs text-muted-foreground">প্রশ্নপত্র স্বয়ংক্রিয়করণ সহকারী</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearHistory}
                className="w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer"
                title="বার্তা মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Message Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="rounded-2xl border bg-muted/20 p-5 text-center my-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm">স্বাগতম! আমি আপনার এআই সহকারী</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                আমি যেকোনো শ্রেণির জন্য নতুন প্রশ্নপত্র তৈরি, মানবণ্টন ও বিষয় নির্ধারণ করতে পারি।
                প্রশ্নপত্র তৈরির সাথে সাথে সরাসরি বিল্ডার ক্যানভাসে আপনাকে নিয়ে যাওয়া হবে।
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 my-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">
                  {error.message?.includes("Rate Limit") || error.message?.includes("সীমা")
                    ? "অনুরোধের সীমা (Rate Limit)"
                    : "একটি সমস্যা দেখা দিয়েছে"}
                </p>
                <p className="opacity-90 leading-relaxed">{error.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <Composer />
      </SheetContent>
    </Sheet>
  );
};
