import cron from "node-cron";
import { PostStatus, type AiTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { aiWriterService } from "@/lib/services/ai-writer-service";
import { postService } from "@/lib/services/post-service";
import { publishService } from "@/lib/services/publish-service";
import { seoService } from "@/lib/services/seo-service";

let started = false;
const runTracker = new Map<string, string>();

function minuteStamp(date = new Date()) {
  return date.toISOString().slice(0, 16);
}

function shouldRunTask(task: AiTask, now = new Date()) {
  const [hh, mm] = (task.runTime || "00:00").split(":");
  const expected = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
  const taskTime = `${String(Number(hh ?? 0)).padStart(2, "0")}:${String(Number(mm ?? 0)).padStart(2, "0")}`;
  if (taskTime !== expected) return false;
  return runTracker.get(task.id) !== minuteStamp(now);
}

async function executeTask(task: AiTask) {
  runTracker.set(task.id, minuteStamp());

  const keywords = await prisma.keywordPool.findMany({
    where: { isUsed: false, language: task.language },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: task.dailyCount
  });

  if (!keywords.length) {
    await publishService.createJob(task.id, null, "failed", `No unused keywords for language=${task.language}`);
    return;
  }

  for (const keywordItem of keywords) {
    try {
      const draft = await aiWriterService.generate({
        primaryKeyword: keywordItem.keyword,
        secondaryKeywords: ["EDGAR", "Form D", "RIA", "ERA"],
        language: task.language,
        articleType: task.articleType,
        audience: "compliance teams",
        tone: "professional",
        wordRange: "1200-1600",
        generateTitle: true,
        generateMeta: true,
        generateFaq: true,
        generateOutline: true,
        generateBody: true
      });

      const post = await postService.create({
        title: draft.title,
        content: draft.content,
        excerpt: draft.content.slice(0, 200),
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        faq: seoService.normalizeFaq(draft.faq),
        language: task.language,
        status: PostStatus.draft,
        publishedAt: null,
        siteIds: Array.isArray(task.targetSitesJson) ? (task.targetSitesJson as string[]) : []
      });

      let finalPostId: string | null = post.id;
      if (task.autoPublish) {
        await publishService.publish(post.id);
      }

      await prisma.keywordPool.update({ where: { id: keywordItem.id }, data: { isUsed: true } });
      await publishService.createJob(
        task.id,
        finalPostId,
        "success",
        task.autoPublish
          ? `Generated and published from keyword: ${keywordItem.keyword}`
          : `Generated draft from keyword: ${keywordItem.keyword}`
      );
    } catch (error) {
      await publishService.createJob(
        task.id,
        null,
        "failed",
        `Keyword ${keywordItem.keyword} failed: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
}

export const schedulerService = {
  start() {
    if (started) return;
    started = true;
    cron.schedule("* * * * *", async () => {
      const tasks = await prisma.aiTask.findMany({ where: { enabled: true } });
      for (const task of tasks) {
        if (shouldRunTask(task)) {
          await executeTask(task);
        }
      }
    });
  },

  async runTaskNow(taskId: string) {
    const task = await prisma.aiTask.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new Error("Task not found");
    }
    await executeTask(task);
    return { ok: true };
  }
};
