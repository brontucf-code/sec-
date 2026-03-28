import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await prisma.regulator.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(await prisma.regulator.create({ data: { name: body.name, code: String(body.code || "").toUpperCase() } }));
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  return NextResponse.json(
    await prisma.regulator.update({ where: { id: body.id }, data: { name: body.name, code: String(body.code || "").toUpperCase() } })
  );
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.regulator.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
