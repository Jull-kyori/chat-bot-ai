"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  Code2,
  FolderKanban,
  Layers3,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Pin,
  Plug,
  Plus,
  Search,
  Sun,
  Moon,
  Trash2,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

export interface SidebarChatItem {
  id: string;
  title: string;
  pinned?: boolean;
  updatedAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  activeChatId?: string;
  chats: SidebarChatItem[];
  userName?: string;
  userPlan?: string;
  onToggleDesktop: () => void;
  onCloseMobile: () => void;
  onNewChat: () => void;
  onSelectChat?: (id: string) => void;
  onOpenSearch?: () => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  onTogglePinChat?: (id: string, nextPinned: boolean) => void;
  onDeleteChat?: (id: string) => void;
}

const WORKSPACE_ITEMS = [
  { href: "/projects", label: "Proyek", icon: FolderKanban },
  { href: "/artifacts", label: "Artefak", icon: Layers3 },
  { href: "/code", label: "Code", icon: Code2 },
  { href: "/plugins", label: "Plugin", icon: Plug },
];

/**
 * Sidebar kiri halaman chat: header, menu navigasi, daftar riwayat chat persisten,
 * aksi rename/pin/hapus, dan profil pengguna.
 */
export function Sidebar({
  isOpen,
  isMobileOpen,
  activeChatId,
  chats,
  userName = "Faza",
  userPlan = "Free",
  onToggleDesktop,
  onCloseMobile,
  onNewChat,
  onSelectChat,
  onOpenSearch,
  onRenameChat,
  onTogglePinChat,
  onDeleteChat,
}: SidebarProps) {
  const [filterMode, setFilterMode] = useState<"all" | "pinned">("all");
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("namabot-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("namabot-theme", nextTheme);
  };

  const visibleChats =
    filterMode === "pinned" ? chats.filter((c) => c.pinned) : chats;

  const commitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRenameChat?.(id, trimmed);
    }
    setEditingChatId(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename(id);
    } else if (e.key === "Escape") {
      setEditingChatId(null);
    }
  };

  const sidebarBody = (
    <div className="chat-sidebar flex h-full w-[300px] lg:w-[340px] flex-col bg-bg-surface border-r border-border-subtle text-text-primary select-none">
      {/* Header Sidebar */}
      <div className="flex h-[56px] items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleDesktop}
            aria-label="Tutup sidebar"
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <Link href="/chat" className="focus:outline-none">
            <BrandLogo iconSize={20} textClassName="text-lg" />
          </Link>
        </div>
      </div>

      {/* Menu Utama */}
      <div className="px-3 pt-1 pb-3 space-y-1">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="flex w-full items-center gap-2.5 rounded-xl bg-bg-elevated/90 px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated-hover cursor-pointer"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-coral text-white">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <span>Buat baru</span>
        </button>

        <nav className="pt-1 space-y-0.5" aria-label="Navigasi utama">
          <button
            type="button"
            onClick={() => { onOpenSearch?.(); onCloseMobile(); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-text-primary cursor-pointer"
          >
            <span className="flex items-center gap-2.5"><Search className="h-4 w-4 shrink-0" /><span>Cari</span></span>
            <kbd className="hidden sm:inline-block rounded-md border border-border-subtle bg-bg-main/60 px-1.5 py-0.5 text-[10px] font-mono text-text-muted">Ctrl+K</kbd>
          </button>
          {WORKSPACE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-text-primary"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => { setFilterMode((current) => current === "pinned" ? "all" : "pinned"); onCloseMobile(); }}
            className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-bg-elevated/60 hover:text-text-primary cursor-pointer", filterMode === "pinned" ? "bg-bg-elevated/60 text-text-primary" : "text-text-secondary")}
          >
            <Pin className="h-4 w-4 shrink-0" /><span>Chat disematkan</span>
          </button>
        </nav>
      </div>

      <div className="mx-3 h-px bg-border-subtle" />

      {/* Bagian Chat dan Tugas */}
      <div className="flex flex-1 flex-col overflow-hidden px-3 pt-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-text-secondary">
            Chat dan tugas
          </span>
          <button
            type="button"
            onClick={() =>
              setFilterMode((prev) => (prev === "all" ? "pinned" : "all"))
            }
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
          >
            <span>{filterMode === "all" ? "Semua" : "Disematkan"}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-0.5">
          {visibleChats.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-text-muted">
              {filterMode === "pinned"
                ? "Belum ada percakapan disematkan."
                : "Belum ada percakapan."}
            </p>
          ) : (
            visibleChats.map((chat) => {
              const isActive = activeChatId === chat.id;
              const menuOpen = openMenuChatId === chat.id;
              const isEditing = editingChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-colors",
                    isActive
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-secondary hover:bg-bg-elevated/55 hover:text-text-primary"
                  )}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => commitRename(chat.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, chat.id)}
                      className="mx-2 my-1 w-full rounded-lg border border-accent-coral/50 bg-bg-input px-2.5 py-1 text-sm text-text-primary focus:outline-none"
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectChat?.(chat.id);
                          onCloseMobile();
                        }}
                        className="flex flex-1 items-center gap-2 overflow-hidden px-3 py-2 text-left text-sm cursor-pointer"
                      >
                        {chat.pinned && (
                          <Pin className="h-3 w-3 shrink-0 text-accent-coral" />
                        )}
                        <span className="truncate">{chat.title}</span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Opsi untuk ${chat.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuChatId(menuOpen ? null : chat.id);
                        }}
                        className={cn(
                          "mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-opacity hover:bg-bg-elevated-hover hover:text-text-primary cursor-pointer",
                          menuOpen
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {menuOpen && !isEditing && (
                    <div className="absolute top-9 right-2 z-20 w-36 rounded-xl border border-border-subtle bg-bg-card-dark p-1 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          onTogglePinChat?.(chat.id, !chat.pinned);
                          setOpenMenuChatId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text-primary hover:bg-bg-elevated cursor-pointer"
                      >
                        <Pin className="h-3.5 w-3.5" />
                        <span>{chat.pinned ? "Lepas pin" : "Sematkan"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditTitle(chat.title);
                          setEditingChatId(chat.id);
                          setOpenMenuChatId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text-primary hover:bg-bg-elevated cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Ubah nama</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteChat?.(chat.id);
                          setOpenMenuChatId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-bg-elevated cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Sidebar: Profil Pengguna */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-bg-elevated/60">
          <div className="flex flex-1 items-center gap-2.5 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-coral/20 text-xs font-semibold text-accent-coral border border-accent-coral/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {userName}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-text-secondary">
                <span>Paket {userPlan}</span>
                <ChevronDown className="h-3 w-3" />
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}
            title={`Tema ${theme === "dark" ? "gelap" : "terang"} · klik untuk mengganti`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Keluar"
            title="Keluar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-red-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 overflow-hidden transition-all duration-250 ease-out",
          isOpen ? "w-[340px]" : "w-0"
        )}
      >
        {sidebarBody}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarBody}</div>
        </div>
      )}
    </>
  );
}
