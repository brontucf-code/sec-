import { NextRequest, NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { postService } from "@/lib/services/post-service";

type PostBody = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  language?: string;
  status?: PostStatus;
  seoTitle?: string;
  seoDescription?: string;
  faq?: unknown;
  sourceName?: string;
  sourceUrl?: string;
  publishedAt?: string;
  categoryId?: string | null;
  regulatorId?: string | null;
  siteIds?: string[];
  tagIds?: string[];
};

export async function GET() {
  return NextResponse.json(await postService.list());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PostBody;
  return NextResponse.json(
    await postService.create({
      title: body.title ?? "",
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content ?? "",
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
  const body = (await req.json()) as PostBody;
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (body.status && Object.keys(body).length <= 2) {
    return NextResponse.json(await postService.setStatus(body.id, body.status));
  }

  return NextResponse.json(
    await postService.update(body.id, {
      title: body.title ?? "",
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content ?? "",
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

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await postService.remove(id);
  return NextResponse.json({ ok: true });
}
