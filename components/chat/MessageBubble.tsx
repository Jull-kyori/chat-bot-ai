"use client";

import { Children, isValidElement, ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import type { ChatAttachment } from "@/components/chat/ChatInput";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
  feedback?: "up" | "down" | null;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onFeedback?: (id: string, value: "up" | "down") => void;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const langMatch = /language-(\w+)/.exec(className || "");
  const language = langMatch ? langMatch[1] : "kode";
  const rawCode = extractText(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Abaikan jika clipboard diblokir
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-border-subtle bg-bg-card-dark">
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-surface/70 px-4 py-2 text-xs text-text-secondary">
        <span className="font-mono lowercase">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Disalin</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Salin kode</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

/**
 * Komponen gelembung pesan:
 * - Pesan user: bubble rata kanan berwarna abu gelap.
 * - Pesan AI: lebar penuh tanpa bubble dengan Markdown, syntax highlighting, kursor streaming, dan tombol aksi.
 */
export function MessageBubble({
  message,
  isStreaming = false,
  onRegenerate,
  onFeedback,
}: MessageBubbleProps) {
  const [copiedMsg, setCopiedMsg] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 1800);
    } catch {
      // Abaikan
    }
  };

  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex w-full justify-end"
      >
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-sm bg-bg-elevated px-4 py-3 text-sm sm:text-[15px] leading-relaxed text-text-primary shadow-sm">
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          {message.attachments?.length ? <div className="mt-2 flex flex-wrap gap-2">{message.attachments.map((attachment, index) => <a key={`${attachment.name}-${index}`} href={attachment.data} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-white/10"><img src={attachment.data} alt={attachment.name} title={attachment.name} className="max-h-48 max-w-56 object-cover" /></a>)}</div> : null}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex w-full items-start gap-3.5"
    >
      <div className="mt-1 shrink-0">
        <BrandLogo showText={false} iconSize={22} animated={isStreaming} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="namabot-prose text-sm sm:text-[15px] leading-relaxed text-text-primary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre({ children }) {
                const firstChild = Children.toArray(children)[0];
                if (
                  isValidElement<{
                    className?: string;
                    children?: ReactNode;
                  }>(firstChild)
                ) {
                  return (
                    <CodeBlock className={firstChild.props.className}>
                      {firstChild.props.children}
                    </CodeBlock>
                  );
                }
                return <pre>{children}</pre>;
              },
              code({ className, children, ...props }) {
                return (
                  <code
                    className={cn(
                      "rounded-md bg-bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-text-primary",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue underline underline-offset-2 hover:text-accent-blue-hover"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content || (isStreaming ? "" : "...")}
          </ReactMarkdown>

          {isStreaming && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-4 w-1.5 translate-y-[2px] animate-pulse rounded-full bg-accent-coral"
            />
          )}
        </div>

        {/* Tombol aksi di bawah pesan AI */}
        {!isStreaming && message.content && (
          <div className="mt-3 flex items-center gap-1 text-text-secondary">
            <button
              type="button"
              onClick={handleCopyMessage}
              title="Salin jawaban"
              aria-label="Salin jawaban"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
            >
              {copiedMsg ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copiedMsg ? "Disalin" : "Salin"}</span>
            </button>

            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Buat ulang jawaban"
                aria-label="Buat ulang jawaban"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Buat ulang</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onFeedback?.(message.id, "up")}
              title="Jawaban bagus"
              aria-label="Jawaban bagus"
              className={cn(
                "rounded-lg p-1.5 transition-colors hover:bg-bg-elevated cursor-pointer",
                message.feedback === "up"
                  ? "text-accent-coral"
                  : "hover:text-text-primary"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onFeedback?.(message.id, "down")}
              title="Jawaban kurang tepat"
              aria-label="Jawaban kurang tepat"
              className={cn(
                "rounded-lg p-1.5 transition-colors hover:bg-bg-elevated cursor-pointer",
                message.feedback === "down"
                  ? "text-red-400"
                  : "hover:text-text-primary"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
