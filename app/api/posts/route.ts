import { PostStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { postService } from "@/lib/services/post-service";

function mapBody(body: any) {
  return {
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    coverImage: body.coverImage,
    language: body.language,
    status: body.status,
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    faq: body.faq,
    sourceName: body.sourceName,
    sourceUrl: body.sourceUrl,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    categoryId: body.categoryId,
    regulatorId: body.regulatorId,
    siteIds: body.siteIds ?? [],
    tagIds: body.tagIds ?? []
  };
}

export async function GET() {
  return NextResponse.json(await postService.list());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(await postService.create(mapBody(body)));
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (body.status && Object.values(PostStatus).includes(body.status)) {
    return NextResponse.json(await postService.setStatus(body.id, body.status));
  }

  return NextResponse.json(await postService.update(body.id, mapBody(body)));
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await postService.remove(id);
  return NextResponse.json({ ok: true });
}
