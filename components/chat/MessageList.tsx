"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { ChatMessage, MessageBubble } from "@/components/chat/MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (id: string, value: "up" | "down") => void;
}

/**
 * Daftar pesan scrollable untuk percakapan aktif dengan auto-scroll ke bawah
 * dan banner error ramah lengkap dengan tombol Coba lagi.
 */
export function MessageList({
  messages,
  isStreaming,
  errorMessage,
  onRetry,
  onRegenerate,
  onFeedback,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming, errorMessage]);

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-[780px] flex-col gap-6 pb-6">
        {messages.map((msg) => {
          const isLastAssistant = msg.id === lastAssistantId;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && isLastAssistant}
              onRegenerate={isLastAssistant ? onRegenerate : undefined}
              onFeedback={onFeedback}
            />
          );
        })}

        {errorMessage && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/30 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Coba lagi</span>
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
