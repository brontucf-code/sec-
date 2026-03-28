import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const keywords = await prisma.keywordPool.findMany({ orderBy: [{ isUsed: "asc" }, { priority: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(keywords);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const keyword = await prisma.keywordPool.create({
    data: {
      keyword: body.keyword,
      type: body.type || "general",
      language: body.language || "en",
      priority: Number(body.priority ?? 1),
      isUsed: Boolean(body.isUsed ?? false)
    }
  });
  return NextResponse.json(keyword);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updated = await prisma.keywordPool.update({
    where: { id: body.id },
    data: {
      keyword: body.keyword,
      type: body.type,
      language: body.language,
      priority: body.priority,
      isUsed: body.isUsed
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.keywordPool.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
