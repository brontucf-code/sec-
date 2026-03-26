import { NextRequest, NextResponse } from "next/server";
import { siteService } from "@/lib/services/site-service";

export async function GET() {
  return NextResponse.json(await siteService.list());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const site = await siteService.create({
    name: body.name,
    siteKey: body.siteKey,
    domain: body.domain,
    logo: body.logo,
    themeColor: body.themeColor,
    defaultLanguage: body.defaultLanguage ?? "en",
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    isActive: body.isActive ?? true
  });
  return NextResponse.json(site);
}

export async function PUT(req: NextRequest) {
  const { id, ...body } = await req.json();
  return NextResponse.json(await siteService.update(id, body));
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await siteService.remove(id);
  return NextResponse.json({ ok: true });
}
