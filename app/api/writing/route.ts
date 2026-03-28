import { PostStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { aiWriterService } from "@/lib/services/ai-writer-service";
import { postService } from "@/lib/services/post-service";
import { seoService } from "@/lib/services/seo-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const draft = await aiWriterService.generate(body);

  if (body.action === "generate") {
    return NextResponse.json({ draft });
  }

  if (body.action === "save" || body.action === "publish") {
    const status = body.action === "publish" ? PostStatus.published : PostStatus.draft;
    const post = await postService.create({
      title: draft.title || body.primaryKeyword,
      content: draft.content,
      excerpt: draft.content.slice(0, 180),
      language: body.language,
      status,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      faq: seoService.normalizeFaq(draft.faq),
      siteIds: body.targetSites ?? [],
      publishedAt: status === PostStatus.published ? new Date() : null
    });

    return NextResponse.json({ draft, post });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
