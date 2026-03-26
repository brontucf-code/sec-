import { NextRequest, NextResponse } from "next/server";
import { postService } from "@/lib/services/post-service";

export async function GET() {
  return NextResponse.json(await postService.list());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(
    await postService.create({
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
    })
  );
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  return NextResponse.json(await postService.setStatus(id, status));
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await postService.remove(id);
  return NextResponse.json({ ok: true });
}
