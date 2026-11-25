"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Code2,
  Compass,
  Ghost,
  Menu,
  PanelLeftOpen,
  PenLine,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatAttachment } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/MessageBubble";
import { MessageList } from "@/components/chat/MessageList";
import { SearchModal } from "@/components/chat/SearchModal";
import { Sidebar, SidebarChatItem } from "@/components/chat/Sidebar";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    icon: Compass,
    label: "Rancang strategi",
    prompt: "Bantu saya menyusun peta jalan peluncuran produk digital dalam 4 minggu.",
  },
  {
    icon: Code2,
    label: "Tulis kode",
    prompt: "Buatkan contoh fungsi TypeScript untuk memproses antrean tugas asinkron.",
  },
  {
    icon: PenLine,
    label: "Susun tulisan",
    prompt: "Bantu tulis ringkasan eksekutif yang menarik untuk proposal proyek AI.",
  },
  {
    icon: Sparkles,
    label: "Brainstorming",
    prompt: "Berikan 5 ide fitur inovatif untuk meningkatkan retensi pengguna aplikasi.",
  },
];

const emptySubscribe = () => () => {};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

interface ChatWorkspaceProps {
  initialChatId?: string;
  userName?: string;
  userPlan?: string;
}

/**
 * Tata letak utama halaman /chat dan /chat/[id]:
 * Sidebar persisten Prisma, streaming SSE real-time, pencarian Ctrl+K,
 * serta aksi rename/hapus/pin.
 */
export function ChatWorkspace({
  initialChatId,
  userName,
  userPlan = "Free",
}: ChatWorkspaceProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedUserName =
    userName ||
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Faza";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chats, setChats] = useState<SidebarChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    initialChatId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [incognito, setIncognito] = useState(false);
  const [lastModelId, setLastModelId] = useState(DEFAULT_MODEL_ID);
  const [lastMode, setLastMode] = useState<"chat" | "cowork">("chat");

  const abortRef = useRef<AbortController | null>(null);

  const greeting = useSyncExternalStore(
    emptySubscribe,
    () => getTimeGreeting(),
    () => "Selamat datang"
  );

  // Shortcut global Ctrl+K / Cmd+K untuk modal pencarian
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Muat daftar riwayat chat dari database
  useEffect(() => {
    let cancelled = false;
    async function loadChats() {
      try {
        const res = await fetch("/api/chats");
        if (!res.ok) return;
        const data = (await res.json()) as { chats?: SidebarChatItem[] };
        if (!cancelled && data.chats) {
          setChats(data.chats);
        }
      } catch {
        // Abaikan jika gagal memuat daftar awal
      }
    }
    void loadChats();
    return () => {
      cancelled = true;
    };
  }, []);

  // Muat pesan saat initialChatId berubah (mis. navigasi ke /chat/[id])
  useEffect(() => {
    if (!initialChatId) return;
    let cancelled = false;
    async function loadChatMessages() {
      try {
        const res = await fetch(`/api/chats/${initialChatId}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          chat?: {
            id: string;
            messages: { id: string; role: "user" | "assistant"; content: string; attachments?: { name: string | null; type: string; url: string }[] }[];
          };
        };
        if (!cancelled && data.chat) {
          setActiveChatId(data.chat.id);
          setMessages(
            data.chat.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              attachments: m.attachments?.map((attachment) => ({ name: attachment.name ?? "Gambar", type: attachment.type, data: attachment.url })),
              feedback: window.localStorage.getItem(`namabot-feedback:${m.id}`) as "up" | "down" | null,
            }))
          );
        }
      } catch {
        // Abaikan
      }
    }
    void loadChatMessages();
    return () => {
      cancelled = true;
    };
  }, [initialChatId]);

  const saveMessageToDb = async (
    chatId: string,
    role: "user" | "assistant",
    content: string,
    attachments: ChatAttachment[] = []
  ) => {
    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content, attachments }),
      });
    } catch {
      // Abaikan error penyimpanan latar belakang
    }
  };

  const streamResponse = async (
    historyToSend: ChatMessage[],
    assistantId: string,
    modelId: string,
    mode: "chat" | "cowork",
    persistedChatId?: string
  ) => {
    setErrorMessage(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          mode,
          messages: historyToSend.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        const errData = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          errData.error || "Gagal mendapatkan respons dari NamaBot."
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload) as { text?: string };
            if (parsed.text) {
              accumulated += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch {
            // Abaikan potongan JSON parsial
          }
        }
      }

      if (persistedChatId && accumulated.trim() && !incognito) {
        await saveMessageToDb(persistedChatId, "assistant", accumulated);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (persistedChatId && accumulated.trim() && !incognito) {
          await saveMessageToDb(persistedChatId, "assistant", accumulated);
        }
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Koneksi terputus saat menerima respons.";
        setErrorMessage(msg);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSend = async (
    text: string,
    modelId: string = lastModelId,
    mode: "chat" | "cowork" = lastMode,
    attachments: ChatAttachment[] = []
  ) => {
    setLastModelId(modelId);
    setLastMode(mode);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      attachments,
    };
    const assistantId = `ai-${Date.now() + 1}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, assistantMsg]);

    let targetChatId = activeChatId;

    if (!incognito) {
      if (!targetChatId) {
        try {
          const res = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstMessage: text, firstMessageAttachments: attachments }),
          });
          if (res.ok) {
            const data = (await res.json()) as { chat: SidebarChatItem };
            targetChatId = data.chat.id;
            setActiveChatId(targetChatId);
            setChats((prev) => [data.chat, ...prev]);
            window.history.replaceState(null, "", `/chat/${targetChatId}`);
          }
        } catch {
          // Tetap lanjut streaming meski gagal simpan DB
        }
      } else {
        void saveMessageToDb(targetChatId, "user", text, attachments);
      }
    }

    await streamResponse(nextHistory, assistantId, modelId, mode, targetChatId);
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleRegenerate = async () => {
    if (isStreaming || messages.length === 0) return;

    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;

    const actualUserIdx = messages.length - 1 - lastUserIndex;
    const historyUpToUser = messages.slice(0, actualUserIdx + 1);
    const assistantId = `ai-${Date.now()}`;

    setMessages([
      ...historyUpToUser,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    await streamResponse(
      historyUpToUser,
      assistantId,
      lastModelId,
      lastMode,
      activeChatId
    );
  };

  const handleFeedback = (id: string, value: "up" | "down") => {
    setMessages((prev) => prev.map((message) => {
      if (message.id !== id) return message;
      const feedback = message.feedback === value ? null : value;
      if (feedback) window.localStorage.setItem(`namabot-feedback:${id}`, feedback);
      else window.localStorage.removeItem(`namabot-feedback:${id}`);
      return { ...message, feedback };
    }));
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    setActiveChatId(undefined);
    setMessages([]);
    setErrorMessage(null);
    setIsStreaming(false);
    router.push("/chat");
  };

  const handleSelectChat = (id: string) => {
    if (id === activeChatId) return;
    router.push(`/chat/${id}`);
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
    await fetch(`/api/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    }).catch(() => {});
  };

  const handleTogglePinChat = async (id: string, nextPinned: boolean) => {
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, pinned: nextPinned } : c
      );
      return [...updated].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
    });
    await fetch(`/api/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: nextPinned }),
    }).catch(() => {});
  };

  const handleDeleteChat = async (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/chats/${id}`, { method: "DELETE" }).catch(() => {});
    if (activeChatId === id) {
      handleNewChat();
    }
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div className="chat-shell relative flex h-screen w-full overflow-hidden bg-bg-chat text-text-primary">
      <Sidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileOpen}
        activeChatId={activeChatId}
        chats={chats}
        userName={resolvedUserName}
        userPlan={userPlan}
        onToggleDesktop={() => setSidebarOpen((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onOpenSearch={() => setSearchOpen(true)}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Area Konten Utama */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Cahaya ambient halus di bagian atas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[540px] -translate-x-1/2 rounded-full bg-accent-coral/8 blur-[120px]"
        />

        {/* Top Bar */}
        <header className="relative z-10 flex h-[56px] shrink-0 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka sidebar"
                className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Badge Paket di Atas Tengah */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface/85 px-3.5 py-1 text-xs text-text-secondary backdrop-blur-sm">
            <span>Paket {userPlan}</span>
            <span>·</span>
            <Link
              href="/login#pricing"
              className="font-medium text-accent-blue hover:text-accent-blue-hover hover:underline"
            >
              Tingkatkan
            </Link>
          </div>

          {/* Ikon Mode Incognito di Pojok Kanan Atas */}
          <button
            type="button"
            onClick={() => setIncognito((prev) => !prev)}
            aria-label="Mode penyamaran"
            title={
              incognito
                ? "Mode penyamaran aktif (riwayat tidak disimpan)"
                : "Aktifkan mode penyamaran"
            }
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
              incognito
                ? "bg-accent-coral/15 text-accent-coral"
                : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            )}
          >
            <Ghost className="h-4 w-4" />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {isEmptyChat ? (
            <motion.main
              key="empty-chat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6"
            >
              <div className="mb-8 flex flex-col items-center text-center">
                {incognito && (
                  <span className="mb-3 rounded-full border border-accent-coral/30 bg-accent-coral/10 px-3 py-0.5 text-[11px] font-medium text-accent-coral">
                    Mode Penyamaran Aktif
                  </span>
                )}
                <div className="flex items-center justify-center gap-3.5">
                  <BrandLogo showText={false} iconSize={34} />
                  <h1 className="font-serif text-3xl font-normal tracking-tight text-text-primary sm:text-4xl">
                    {greeting}, {resolvedUserName}
                  </h1>
                </div>
              </div>

              <ChatInput
                isStreaming={isStreaming}
                onSend={handleSend}
                onStop={handleStop}
              />

              {/* Chip Saran Cepat dengan animasi bertahap */}
              <div className="mt-5 flex max-w-[780px] flex-wrap items-center justify-center gap-2">
                {QUICK_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.08 + idx * 0.05 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(item.prompt)}
                      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface/75 px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
                    >
                      <Icon className="h-3.5 w-3.5 text-accent-coral" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.main>
          ) : (
            <motion.div
              key="active-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22 }}
              className="relative z-10 flex flex-1 flex-col overflow-hidden"
            >
              <MessageList
                messages={messages}
                isStreaming={isStreaming}
                errorMessage={errorMessage}
                onRetry={handleRegenerate}
                onRegenerate={handleRegenerate}
                onFeedback={handleFeedback}
              />

              <div className="shrink-0 bg-gradient-to-t from-bg-chat via-bg-chat/95 to-transparent px-4 pt-2 pb-4 sm:px-6 sm:pb-6">
                <div className="mx-auto flex w-full max-w-[780px] flex-col items-center">
                  <ChatInput
                    isStreaming={isStreaming}
                    onSend={handleSend}
                    onStop={handleStop}
                    placeholder="Balas NamaBot..."
                  />
                  <p className="mt-2 text-center text-[11px] text-text-muted">
                    NamaBot dapat membuat kekeliruan. Periksa kembali informasi penting.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SearchModal
        isOpen={searchOpen}
        chats={chats}
        onClose={() => setSearchOpen(false)}
        onSelectChat={handleSelectChat}
      />
    </div>
  );
}
