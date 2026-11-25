import { NextResponse } from "next/server";
import { AI_MODELS } from "@/lib/models";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; type: string; data: string }[];
}

interface ChatRequestBody {
  messages?: IncomingMessage[];
  modelId?: string;
  mode?: "chat" | "cowork";
}

function buildSimulatedReply(userPrompt: string, modelLabel: string, mode: string, attachmentCount: number): string {
  const lower = userPrompt.toLowerCase();

  if (lower.includes("kode") || lower.includes("typescript") || lower.includes("react") || lower.includes("fungsi")) {
    return `Berikut contoh implementasi **TypeScript** yang bersih dan terstruktur untuk kebutuhan Anda (${modelLabel} · mode ${mode}):

### Contoh Implementasi

\`\`\`typescript
interface TaskResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function prosesData<T>(items: T[]): Promise<TaskResult<T[]>> {
  if (!items.length) {
    return { ok: false, error: "Daftar item tidak boleh kosong." };
  }

  return {
    ok: true,
    data: items.slice(0, 10),
  };
}
\`\`\`

### Poin Penting
- Menggunakan *generic type* \`<T>\` agar aman secara tipe (*type-safe*).
- Mengembalikan objek hasil yang eksplisit alih-alih melempar error tanpa konteks.

> **Tip:** Tambahkan \`LLM_API_KEY\` di file \`.env\` untuk menghubungkan respons langsung ke Anthropic atau OpenAI.`;
  }

  return `Tentu, mari kita bahas permintaan Anda mengenai **"${userPrompt.slice(0, 80)}"** menggunakan **${modelLabel}** (mode *${mode}*).${attachmentCount ? `\n\nSaya menerima ${attachmentCount} gambar terlampir. Mode demo belum dapat menganalisis isi gambar; tambahkan LLM_API_KEY untuk mengaktifkan analisis visual.` : ""}

### Ringkasan Langkah yang Disarankan

1. **Tetapkan tujuan utama** — Pastikan ruang lingkup dan hasil akhir terdefinisi dengan jelas sebelum mulai mengeksekusi.
2. **Pecah menjadi bagian kecil** — Fokus pada komponen inti terlebih dahulu agar progres lebih mudah diukur.
3. **Validasi lebih awal** — Uji asumsi atau prototipe sesegera mungkin untuk mengurangi revisi di akhir.

| Tahap | Fokus Utama | Output |
| :--- | :--- | :--- |
| Eksplorasi | Pemetaan masalah & ide | Catatan ringkas |
| Eksekusi | Implementasi bertahap | Draf / prototipe |
| Evaluasi | Uji coba & penyempurnaan | Hasil siap pakai |

Jika Anda ingin saya memperdalam salah satu bagian di atas, beri tahu saja bagian mana yang ingin kita kerjakan lebih dulu!`;
}

function encodeSseChunk(payload: string): Uint8Array {
  return new TextEncoder().encode(`data: ${payload}\n\n`);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const model = AI_MODELS.find((m) => m.id === body.modelId) ?? AI_MODELS[0];
    const mode = body.mode ?? "chat";

    if (!messages.length) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    const apiKey = process.env.LLM_API_KEY?.trim();

    // 1. Jika LLM_API_KEY tersedia: teruskan streaming ke Anthropic atau OpenAI
    if (apiKey) {
      const isAnthropic = apiKey.startsWith("sk-ant-");

      if (isAnthropic) {
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: req.signal,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model:
              model.id === "model-c-reasoning"
                ? "claude-3-7-sonnet-latest"
                : "claude-3-5-sonnet-latest",
            max_tokens: 2048,
            stream: true,
            system:
              mode === "cowork"
                ? "Anda adalah rekan kerja NamaBot berbahasa Indonesia. Bantu pengguna menyelesaikan pekerjaan secara kolaboratif, ajukan klarifikasi bila perlu, dan berikan hasil terstruktur yang siap dipakai."
                : "Anda adalah NamaBot, asisten AI berbahasa Indonesia yang ramah, ringkas, dan akurat.",
            messages: messages.map((m) => ({
              role: m.role,
              content: [
                ...(m.content ? [{ type: "text", text: m.content }] : []),
                ...(m.attachments ?? []).flatMap((attachment) => {
                  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/i.exec(attachment.data);
                  return match ? [{ type: "image", source: { type: "base64", media_type: match[1], data: match[2] } }] : [];
                }),
              ],
            })),
          }),
        });

        if (!upstream.ok || !upstream.body) {
          return NextResponse.json(
            { error: "Gagal terhubung ke layanan AI (Anthropic)." },
            { status: upstream.status || 502 }
          );
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                  if (!line.startsWith("data: ")) continue;
                  const raw = line.slice(6).trim();
                  if (!raw || raw === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(raw) as {
                      type?: string;
                      delta?: { text?: string };
                    };
                    if (
                      parsed.type === "content_block_delta" &&
                      parsed.delta?.text
                    ) {
                      controller.enqueue(
                        encodeSseChunk(JSON.stringify({ text: parsed.delta.text }))
                      );
                    }
                  } catch {
                    // Abaikan baris SSE parsial
                  }
                }
              }
              controller.enqueue(encodeSseChunk("[DONE]"));
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      }

      // OpenAI / OpenAI-compatible
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: req.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.id === "model-b-fast" ? "gpt-4o-mini" : "gpt-4o",
          stream: true,
          messages: [
            {
              role: "system",
              content: mode === "cowork"
                ? "Anda adalah rekan kerja NamaBot berbahasa Indonesia. Bantu pengguna menyelesaikan pekerjaan secara kolaboratif, ajukan klarifikasi bila perlu, dan berikan hasil terstruktur yang siap dipakai."
                : "Anda adalah NamaBot, asisten AI berbahasa Indonesia yang ramah, ringkas, dan akurat.",
            },
            ...messages.map((message) => ({
              role: message.role,
              content: [
                ...(message.content ? [{ type: "text", text: message.content }] : []),
                ...(message.attachments ?? []).flatMap((attachment) =>
                  /^data:image\//i.test(attachment.data)
                    ? [{ type: "image_url", image_url: { url: attachment.data, detail: "auto" } }]
                    : []
                ),
              ],
            })),
          ],
        }),
      });

      if (!upstream.ok || !upstream.body) {
        return NextResponse.json(
          { error: "Gagal terhubung ke layanan AI (OpenAI)." },
          { status: upstream.status || 502 }
        );
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const raw = line.slice(6).trim();
                if (!raw) continue;
                if (raw === "[DONE]") {
                  controller.enqueue(encodeSseChunk("[DONE]"));
                  continue;
                }
                try {
                  const parsed = JSON.parse(raw) as {
                    choices?: { delta?: { content?: string } }[];
                  };
                  const text = parsed.choices?.[0]?.delta?.content;
                  if (text) {
                    controller.enqueue(encodeSseChunk(JSON.stringify({ text })));
                  }
                } catch {
                  // Abaikan baris SSE parsial
                }
              }
            }
            controller.enqueue(encodeSseChunk("[DONE]"));
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 2. Mode Simulasi Streaming Lokal (jika LLM_API_KEY belum diisi di .env)
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const attachmentCount = messages.reduce((count, message) => count + (message.attachments?.length ?? 0), 0);
    const fullText = buildSimulatedReply(
      lastUserMessage,
      `${model.name} · ${model.tier}`,
      mode,
      attachmentCount
    );
    const tokens = fullText.match(/(\S+\s*|\n)/g) ?? [fullText];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const token of tokens) {
            if (req.signal.aborted) break;
            controller.enqueue(encodeSseChunk(JSON.stringify({ text: token })));
            await new Promise((r) => setTimeout(r, 22));
          }
          controller.enqueue(encodeSseChunk("[DONE]"));
          controller.close();
        } catch {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesan Anda." },
      { status: 500 }
    );
  }
}
