"use client";

import React, { createContext, useContext, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { useBuilderStore } from "@/modules/question-paper-builder/store/use-builder-store";
import { useAssistantStore } from "./use-assistant-store";

interface AssistantContextType {
  messages: UIMessage[];
  sendMessage: (options: { text: string }) => void;
  stop: () => void;
  status: "idle" | "submitted" | "streaming" | "ready" | "error";
  isLoading: boolean;
  error: Error | undefined;
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  clearMessages: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

const AssistantContext = createContext<AssistantContextType | null>(null);

export const useAssistant = () => {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return ctx;
};

interface Props {
  children: React.ReactNode;
}

export const AssistantProvider: React.FC<Props> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOpen, setIsOpen, toggleOpen, activePaperId, setActivePaperId } = useAssistantStore();

  // Track extracted paperId from current builder route
  useEffect(() => {
    const match = pathname.match(/\/question-papers\/([^/]+)\/builder/);
    if (match && match[1]) {
      setActivePaperId(match[1]);
    } else {
      setActivePaperId(null);
    }
  }, [pathname, setActivePaperId]);

  // Keep track of paper creations we've already redirected for
  const handledCreatedPaperIds = useRef<Set<string>>(new Set());

  // Configure chat transport
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: () => ({
          context: {
            pathname,
            paperId: activePaperId || undefined,
          },
        }),
      }),
    [pathname, activePaperId]
  );

  const {
    messages,
    sendMessage,
    stop,
    status,
    error,
    setMessages,
  } = useChat({
    transport,
    onFinish: ({ message }) => {
      // Inspect tool calls inside the completed assistant message
      if (Array.isArray(message.parts)) {
        for (const part of message.parts as any[]) {
          const toolName =
            part.toolName ||
            (typeof part.type === "string" ? part.type.replace("tool-", "") : "");
          const isDone = part.state === "output-available" && part.output?.ok;

          if (isDone) {
            const affectedPaperId = part.output?.paperId;

            // 1. Create paper -> auto-redirect
            if ((toolName === "createPaper" || toolName === "createPaperSmart") && affectedPaperId) {
              if (!handledCreatedPaperIds.current.has(affectedPaperId)) {
                handledCreatedPaperIds.current.add(affectedPaperId);
                queryClient.invalidateQueries(trpc.questionPaper.pathFilter());
                setIsOpen(true);
                router.push(`/question-papers/${affectedPaperId}/builder`);
              }
            }

            // 2. Settings update -> instant canvas sync
            if (toolName === "updatePaperSettings" && part.output?.patch) {
              queryClient.invalidateQueries(trpc.questionPaper.pathFilter());
              const currentOpenPaperId = useBuilderStore.getState().paperId;
              if (currentOpenPaperId && currentOpenPaperId === affectedPaperId) {
                useBuilderStore.getState().applyRemoteSettings(part.output.patch);
              }
            }

            // 3. Structure & Question updates -> rehydrate open canvas
            if (
              [
                "upsertSection",
                "deleteSection",
                "upsertSubject",
                "deleteSubject",
                "autoFillDistribution",
                "replaceQuestion",
                "removeQuestions",
                "reorderQuestions",
                "addAlternativeQuestion",
                "removeAlternativeQuestion",
                "swapAlternativeQuestion",
                "generatePaperSets",
              ].includes(toolName)
            ) {
              queryClient.invalidateQueries(trpc.questionPaper.pathFilter());
              const currentOpenPaperId = useBuilderStore.getState().paperId;
              if (currentOpenPaperId && currentOpenPaperId === affectedPaperId) {
                useBuilderStore.getState().requestRehydrate();

                if (part.output?.newQuestionId) {
                  useBuilderStore.getState().flashHighlightItem(part.output.newQuestionId);
                } else if (part.output?.distributionId) {
                  useBuilderStore.getState().flashHighlightItem(part.output.distributionId);
                }
              }
            }

            // 4. Delete paper -> invalidate & navigate back if inside builder
            if (toolName === "deletePaper" && affectedPaperId) {
              queryClient.invalidateQueries(trpc.questionPaper.pathFilter());
              const currentOpenPaperId = useBuilderStore.getState().paperId;
              if (currentOpenPaperId && currentOpenPaperId === affectedPaperId) {
                router.push("/question-papers");
              }
            }
          }
        }
      }
    },
  });

  const storageKey = `shikhonary_chat_${activePaperId || "global"}`;

  // Load chat history from localStorage on activePaperId change or mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
      setMessages([]);
    } catch (e) {
      // Ignore parsing errors
    }
  }, [storageKey, setMessages]);

  // Persist latest chat messages
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-20)));
      } catch (e) {
        // Ignore quota errors
      }
    }
  }, [messages, storageKey]);

  const clearMessages = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    setMessages([]);
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <AssistantContext.Provider
      value={{
        messages,
        sendMessage,
        stop,
        status,
        isLoading,
        error,
        setMessages,
        clearMessages,
        isOpen,
        setIsOpen,
        toggleOpen,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};
