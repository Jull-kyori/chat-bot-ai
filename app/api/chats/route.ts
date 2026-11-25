import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
        ...(q ? { title: { contains: q } } : {}),
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        pinned: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chats });
  } catch (err) {
    console.error("GET /api/chats error:", err);
    return NextResponse.json(
      { error: "Gagal memuat riwayat chat." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title?: string;
      firstMessage?: string;
      firstMessageAttachments?: { name: string; type: string; data: string }[];
    };

    const rawTitle = body.title?.trim() || body.firstMessage?.trim() || "Chat baru";
    const title =
      rawTitle.length > 50 ? `${rawTitle.slice(0, 50).trim()}...` : rawTitle;

    const chat = await prisma.chat.create({
      data: {
        title,
        userId: user.id,
        ...(body.firstMessage || body.firstMessageAttachments?.length
          ? {
            messages: {
              create: {
                role: "user",
                  content: body.firstMessage ?? "",
                attachments: {
                  create: (body.firstMessageAttachments ?? []).map((attachment) => ({
                    name: attachment.name,
                    type: attachment.type,
                    url: attachment.data,
                  })),
                },
              },
            },
          }
          : {}),
      },
      select: {
        id: true,
        title: true,
        pinned: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (err) {
    console.error("POST /api/chats error:", err);
    return NextResponse.json(
      { error: "Gagal membuat percakapan baru." },
      { status: 500 }
    );
  }
}

