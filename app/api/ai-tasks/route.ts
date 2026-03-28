import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { schedulerService } from "@/lib/services/scheduler-service";

schedulerService.start();

export async function GET() {
  return NextResponse.json(
    await prisma.aiTask.findMany({
      orderBy: { createdAt: "desc" },
      include: { publishJobs: { orderBy: { createdAt: "desc" }, take: 10 } }
    })
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.aiTask.create({
    data: {
      taskName: body.taskName,
      enabled: body.enabled ?? true,
      runTime: body.runTime,
      language: body.language,
      dailyCount: Number(body.dailyCount ?? 1),
      keywordSource: body.keywordSource,
      articleType: body.articleType,
      autoPublish: body.autoPublish ?? false,
      targetSitesJson: body.targetSites ?? []
    }
  });
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (body.action === "run-now") {
    await schedulerService.runTaskNow(body.id);
    return NextResponse.json({ ok: true });
  }

  const task = await prisma.aiTask.update({
    where: { id: body.id },
    data: {
      taskName: body.taskName,
      enabled: body.enabled,
      runTime: body.runTime,
      language: body.language,
      dailyCount: body.dailyCount,
      keywordSource: body.keywordSource,
      articleType: body.articleType,
      autoPublish: body.autoPublish,
      targetSitesJson: body.targetSites
    }
  });

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.aiTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
