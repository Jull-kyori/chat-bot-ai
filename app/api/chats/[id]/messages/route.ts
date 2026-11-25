import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const chat = await prisma.chat.findFirst({
      where: { id, userId: user.id },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Percakapan tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = (await req.json()) as {
      role?: "user" | "assistant";
      content?: string;
      attachments?: { name: string; type: string; data: string }[];
    };

    if (!body.role || (!body.content?.trim() && !body.attachments?.length)) {
      return NextResponse.json(
        { error: "Role dan isi pesan wajib diisi." },
        { status: 400 }
      );
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId: id,
          role: body.role,
          content: body.content ?? "",
          attachments: {
            create: (body.attachments ?? []).map((attachment) => ({
              name: attachment.name,
              type: attachment.type,
              url: attachment.data,
            })),
          },
        },
      }),
      prisma.chat.update({
        where: { id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("POST /api/chats/[id]/messages error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan pesan." },
      { status: 500 }
    );
  }
}

