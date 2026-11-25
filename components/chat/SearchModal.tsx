"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Pin, Search, X } from "lucide-react";
import { SidebarChatItem } from "@/components/chat/Sidebar";

interface SearchModalProps {
  isOpen: boolean;
  chats: SidebarChatItem[];
  onClose: () => void;
  onSelectChat: (id: string) => void;
}

/**
 * Modal pencarian riwayat percakapan (Ctrl+K / Cmd+K).
 */
export function SearchModal({
  isOpen,
  chats,
  onClose,
  onSelectChat,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:pt-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Cari percakapan"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari riwayat percakapan..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup pencarian"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[340px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-xs text-text-muted">
                  Tidak ada percakapan yang cocok dengan &ldquo;{query}&rdquo;.
                </p>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((chat) => (
                    <li key={chat.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectChat(chat.id);
                          setQuery("");
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-bg-elevated cursor-pointer"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          {chat.pinned ? (
                            <Pin className="h-3.5 w-3.5 shrink-0 text-accent-coral" />
                          ) : (
                            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                          )}
                          <span className="truncate">{chat.title}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-text-muted">
                          Buka
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

