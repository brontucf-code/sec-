import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return NextResponse.json([], { status: 404 });

  const posts = await prisma.post.findMany({
    where: { status: "published", postSites: { some: { siteId: site.id } } },
    orderBy: { publishedAt: "desc" }
  });
  return NextResponse.json(posts);
}
