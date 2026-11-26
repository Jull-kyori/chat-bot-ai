"use client";

import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  FileImage,
  Mic,
  Plus,
  X,
  Square,
} from "lucide-react";
import { AI_MODELS, DEFAULT_MODEL_ID } from "@/lib/models";
import { cn } from "@/lib/utils";

type InteractionMode = "chat" | "cowork";

export interface ChatAttachment {
  name: string;
  type: string;
  data: string;
}

interface ChatInputProps {
  onSend?: (message: string, modelId: string, mode: InteractionMode, attachments?: ChatAttachment[]) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
}

/**
 * Kotak input chat membulat dengan auto-resize textarea, toggle Chat/Cowork,
 * pemilih model dari lib/models.ts, tombol lampiran, mikrofon, dan kirim.
 */
export function ChatInput({
  onSend,
  isStreaming = false,
  onStop,
  placeholder = "Bagaimana saya bisa membantu Anda hari ini?",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<InteractionMode>("chat");
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const selectedModel =
    AI_MODELS.find((m) => m.id === selectedModelId) ?? AI_MODELS[0];

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || isStreaming) return;
    onSend?.(trimmed, selectedModelId, mode, attachments);
    setValue("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setVoiceError("Saat ini lampiran yang didukung adalah gambar.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setVoiceError(`${file.name} melebihi batas 5 MB.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAttachments((current) => [...current, { name: file.name, type: file.type, data: reader.result as string }]);
          setVoiceError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    type SpeechResult = { 0: { transcript: string }; isFinal: boolean };
    type SpeechRecognitionLike = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Dikte suara tidak didukung browser ini. Coba Chrome atau Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ");
      setValue((current) => `${current}${current ? " " : ""}${transcript}`);
      requestAnimationFrame(adjustHeight);
    };
    recognition.onerror = () => setVoiceError("Mikrofon tidak dapat digunakan. Periksa izin browser.");
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setVoiceError(null);
    } catch {
      setVoiceError("Gagal memulai dikte suara.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-composer relative w-full max-w-[780px] rounded-3xl border border-border-subtle bg-bg-surface p-3.5 sm:p-4 shadow-lg shadow-black/20 transition-colors focus-within:border-border-strong">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {attachments.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{attachments.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated/70 px-2 py-1.5 text-xs text-text-secondary"><FileImage className="h-4 w-4 text-accent-coral" /><span className="max-w-36 truncate">{file.name}</span><button type="button" aria-label={`Hapus ${file.name}`} onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X className="h-3.5 w-3.5" /></button></div>)}</div>}
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
                aria-label="Ketik pesan untuk VerapritygurlAI"
        className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-1.5 py-1 text-sm sm:text-[15px] leading-relaxed text-text-primary placeholder:text-text-secondary focus:outline-none"
      />

      {/* Baris Bawah Kontrol */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Kiri: Lampiran + Segmented Chat | Cowork */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Lampirkan gambar"
            title="Lampirkan gambar (maks. 5 MB)"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-bg-elevated/60 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>

          <div className="inline-flex items-center rounded-xl border border-border-subtle bg-bg-main/60 p-0.5 text-xs">
            {(["chat", "cowork"] as const).map((tab) => {
              const active = mode === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-medium capitalize transition-colors cursor-pointer",
                    active
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {tab === "chat" ? "Chat" : "Cowork"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kanan: Pemilih Model + Mikrofon + Tombol Kirim */}
        <div className="flex items-center gap-1.5">
          {/* Dropdown Model */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setModelDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
            >
              <span>
                {selectedModel.name} · {selectedModel.tier}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {modelDropdownOpen && (
              <div className="absolute right-0 bottom-10 z-30 w-64 rounded-2xl border border-border-subtle bg-bg-card-dark p-1.5 shadow-2xl">
                {AI_MODELS.map((model) => {
                  const active = model.id === selectedModelId;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors cursor-pointer",
                        active
                          ? "bg-bg-elevated text-text-primary"
                          : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
                      )}
                    >
                      <span className="text-xs font-medium text-text-primary">
                        {model.name} · {model.tier}
                      </span>
                      <span className="mt-0.5 text-[11px] text-text-muted">
                        {model.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tombol Mikrofon + Chevron kecil */}
          <div className="inline-flex items-center rounded-xl border border-border-subtle/80 bg-bg-elevated/40">
            <button
              type="button"
              onClick={toggleVoiceInput}
              aria-label="Dikte suara"
              title="Dikte suara"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-l-xl transition-colors cursor-pointer",
                isListening
                  ? "text-accent-coral"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
            </button>
          </div>

          {/* Tombol Kirim / Stop */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Hentikan respons"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-text-primary transition-colors hover:bg-bg-elevated-hover cursor-pointer"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() && attachments.length === 0}
              aria-label="Kirim pesan"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-coral text-white transition-all hover:bg-accent-coral-hover disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {voiceError && <p role="status" className="mt-2 px-1 text-xs text-amber-300">{voiceError}</p>}
    </div>
  );
}
