import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function dayRange(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

export async function GET() {
  const { start, end } = dayRange();

  const [todayGenerated, todayPublished, recentJobs, recentFailures] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.post.count({ where: { status: "published", publishedAt: { gte: start, lte: end } } }),
    prisma.publishJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { task: { select: { taskName: true } }, post: { select: { title: true, slug: true, status: true } } }
    }),
    prisma.publishJob.findMany({
      where: { status: "failed" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { task: { select: { taskName: true } } }
    })
  ]);

  return NextResponse.json({ todayGenerated, todayPublished, recentJobs, recentFailures });
}
