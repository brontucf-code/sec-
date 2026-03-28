import { PostStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { aiWriterService } from "@/lib/services/ai-writer-service";
import { postService } from "@/lib/services/post-service";
import { seoService } from "@/lib/services/seo-service";

function resolveDraft(body: any) {
  if (body.draft) return body.draft;
  return aiWriterService.generate(body);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const draft = await resolveDraft(body);

  if (body.action === "generate") {
    return NextResponse.json({ draft });
  }

  if (body.action === "save" || body.action === "publish") {
    const status = body.action === "publish" ? PostStatus.published : PostStatus.draft;
    const post = await postService.create({
      title: draft.title || body.primaryKeyword,
      slug: draft.slug,
      excerpt: draft.excerpt || draft.content.slice(0, 180),
      content: draft.content,
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
