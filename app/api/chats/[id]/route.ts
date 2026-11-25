import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const chat = await prisma.chat.findFirst({
      where: { id, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachments: true },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Percakapan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (err) {
    console.error("GET /api/chats/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal memuat percakapan." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await req.json()) as { title?: string; pinned?: boolean };

    const existing = await prisma.chat.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Percakapan tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.chat.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" && body.title.trim()
          ? { title: body.title.trim() }
          : {}),
        ...(typeof body.pinned === "boolean" ? { pinned: body.pinned } : {}),
      },
      select: {
        id: true,
        title: true,
        pinned: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chat: updated });
  } catch (err) {
    console.error("PATCH /api/chats/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui percakapan." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.chat.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Percakapan tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.chat.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/chats/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus percakapan." },
      { status: 500 }
    );
  }
}

