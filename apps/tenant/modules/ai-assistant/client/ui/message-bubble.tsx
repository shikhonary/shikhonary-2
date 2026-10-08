"use client";

import React from "react";
import type { UIMessage } from "ai";
import { Bot, User, Loader2, CheckCircle2, FilePlus, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { ApprovalCard } from "./approval-card";
import { BlueprintPreviewCard } from "./blueprint-preview-card";

interface Props {
  message: UIMessage;
}

function formatInlineContent(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Serialized numbered items e.g. "১. বহুনির্বাচনী..." or "1. MCQ..."
        const numberMatch = trimmed.match(/^([০-৯\d]+[\.\)])\s*(.+)/);
        if (numberMatch && numberMatch[1] && numberMatch[2]) {
          const serial = numberMatch[1];
          const rest = numberMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="font-bold text-primary shrink-0 text-xs mt-0.5">
                {serial}
              </span>
              <div className="flex-1">{formatInlineContent(rest)}</div>
            </div>
          );
        }

        // Bullet items e.g. "• শ্রেণি: দশম শ্রেণি" or "- Class: 10"
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          const content = trimmed.replace(/^[•\-]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-primary/70 shrink-0">•</span>
              <div className="flex-1">{formatInlineContent(content)}</div>
            </div>
          );
        }

        // Headings / Highlighted titles
        if (
          trimmed.startsWith("#") ||
          trimmed.startsWith("📋") ||
          trimmed.startsWith("📝") ||
          trimmed.startsWith("❓") ||
          trimmed.startsWith("✅")
        ) {
          return (
            <div key={idx} className="font-semibold text-foreground pt-1 pb-0.5">
              {formatInlineContent(trimmed)}
            </div>
          );
        }

        return <div key={idx}>{formatInlineContent(line)}</div>;
      })}
    </div>
  );
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isAssistant = message.role === "assistant";

  // Extract tool call badges from parts
  const toolParts = (Array.isArray(message.parts) ? message.parts : []).filter(
    (p: any) =>
      p.type === "dynamic-tool" ||
      p.type === "tool-invocation" ||
      p.type === "tool-call" ||
      p.type === "tool-result" ||
      (typeof p.type === "string" && p.type.startsWith("tool-"))
  );

  return (
    <div
      className={cn(
        "flex gap-3 text-sm font-sans mb-4",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isAssistant
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[85%]",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        {/* Tool Activity Indicators & Interactive Cards */}
        {toolParts.length > 0 && (
          <div className="flex flex-col gap-1 my-1 w-full">
            {toolParts.map((tool: any, idx: number) => {
              const name =
                tool.toolName ||
                tool.toolInvocation?.toolName ||
                tool.name ||
                (typeof tool.type === "string" ? tool.type.replace("tool-", "") : "");

              const output =
                tool.output ||
                tool.result ||
                tool.data ||
                tool.toolInvocation?.result ||
                tool.toolInvocation?.output;

              const isRunning =
                tool.state === "input-streaming" ||
                tool.state === "call" ||
                tool.toolInvocation?.state === "call" ||
                tool.toolInvocation?.state === "partial-call";

              const isDone =
                tool.state === "output-available" ||
                tool.toolInvocation?.state === "result" ||
                !!output;

              let label = "কার্যক্রম সম্পাদন হচ্ছে...";
              let icon = <Loader2 className="w-3 h-3 animate-spin text-primary" />;

              if (name === "previewPaperBlueprint") {
                label = isRunning ? "ব্লুপ্রিন্ট ও নম্বর বণ্টন প্রস্তুত হচ্ছে..." : "ব্লুপ্রিন্ট প্রস্তুত সম্পন্ন";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "createPaperSmart") {
                const isConfirmed = tool.input?.confirmed === true || tool.toolInvocation?.args?.confirmed === true;
                label = isRunning
                  ? (isConfirmed ? "প্রশ্নপত্র তৈরি করা হচ্ছে..." : "ব্লুপ্রিন্ট ও নম্বর বণ্টন প্রস্তুত হচ্ছে...")
                  : (isConfirmed ? "প্রশ্নপত্র সফলভাবে তৈরি হয়েছে" : "ব্লুপ্রিন্ট প্রস্তুত সম্পন্ন");
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "listClasses" || name === "listSubjects") {
                label = isRunning ? "শ্রেণি ও বিষয় অনুসন্ধান করা হচ্ছে..." : "শ্রেণি ও বিষয় যাচাই করা হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <Search className="w-3 h-3 text-muted-foreground" />
                );
              } else if (name === "getSubjectBlueprint") {
                label = isRunning ? "প্রশ্নের বিন্যাস বিশ্লেষণ করা হচ্ছে..." : "প্রশ্নের বিন্যাস লোড করা হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "createPaper") {
                label = isRunning ? "প্রশ্নপত্র তৈরি করা হচ্ছে..." : "প্রশ্নপত্র সফলভাবে তৈরি হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <FilePlus className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "autoFillDistribution") {
                label = isRunning ? "প্রশ্ন বাছাই ও মানবণ্টন পূরণ করা হচ্ছে..." : "প্রশ্নপত্র ক্যানভাসে যুক্ত হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "replaceQuestion") {
                label = isRunning ? "প্রশ্ন পরিবর্তন করা হচ্ছে..." : "প্রশ্ন সফলভাবে পরিবর্তন করা হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "removeQuestions") {
                label = isRunning ? "প্রশ্ন মুছে ফেলা হচ্ছে..." : "প্রশ্ন তালিকা থেকে মুছে ফেলা হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "updatePaperSettings") {
                label = isRunning ? "লেআউট ও পৃষ্ঠা বিন্যাস পরিবর্তন হচ্ছে..." : "লেআউট পরিবর্তন সম্পন্ন হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "deletePaper" || name === "deleteSection" || name === "deleteSubject") {
                label = isRunning ? "মুছে ফেলার কাজ চলছে..." : "সফলভাবে মুছে ফেলা হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-destructive" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "generatePaperSets") {
                label = isRunning ? "প্রশ্নপত্রের একাধিক সেট তৈরি করা হচ্ছে..." : "প্রশ্ন সেট সফলভাবে তৈরি হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "addAlternativeQuestion") {
                label = isRunning ? "বিকল্প প্রশ্ন ('অথবা') যুক্ত করা হচ্ছে..." : "বিকল্প প্রশ্ন যুক্ত হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "removeAlternativeQuestion") {
                label = isRunning ? "বিকল্প প্রশ্ন মুছে ফেলা হচ্ছে..." : "বিকল্প প্রশ্ন মুছে ফেলা হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              } else if (name === "swapAlternativeQuestion") {
                label = isRunning ? "বিকল্প প্রশ্ন অদলবদল করা হচ্ছে..." : "বিকল্প প্রশ্ন অদলবদল সম্পন্ন হয়েছে";
                icon = isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                );
              }

              const isBlueprintPreview =
                output?.isPreview === true ||
                (output?.subjects && output?.className && output?.ok !== false);

              return (
                <div key={idx} className="flex flex-col gap-1 w-full">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5 flex items-center gap-1.5 font-normal rounded-md w-fit",
                      isDone && "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    )}
                  >
                    {icon}
                    <span>{label}</span>
                  </Badge>

                  {/* Serialized Blueprint Preview Card */}
                  {isBlueprintPreview && (
                    <BlueprintPreviewCard output={output} />
                  )}

                  {/* Human Approval Guard Card */}
                  {output?.needsApproval && (
                    <ApprovalCard
                      actionSummary={output.actionSummary || output.message}
                      actionType={output.actionType}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Message Text Content */}
        {Array.isArray(message.parts) ? (
          message.parts.map((part: any, pIdx: number) => {
            if (part.type === "text" && part.text?.trim()) {
              return (
                <div
                  key={pIdx}
                  className={cn(
                    "rounded-2xl px-4 py-3 shadow-xs w-full",
                    isAssistant
                      ? "bg-card border text-card-foreground"
                      : "bg-primary text-primary-foreground font-medium"
                  )}
                >
                  <FormattedMessageText text={part.text} />
                </div>
              );
            }
            return null;
          })
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 shadow-xs w-full",
              isAssistant
                ? "bg-card border text-card-foreground"
                : "bg-primary text-primary-foreground font-medium"
            )}
          >
            <FormattedMessageText text={(message as any).content || ""} />
          </div>
        )}
      </div>
    </div>
  );
};
