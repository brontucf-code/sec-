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
  const keywords = [`SEC ${task.keywordSource}`, `Reg D ${task.keywordSource}`, `Compliance ${task.keywordSource}`].slice(
    0,
    task.dailyCount
  );

  for (const keyword of keywords) {
    const draft = await aiWriterService.generate({
      primaryKeyword: keyword,
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
      status: task.autoPublish ? PostStatus.published : PostStatus.draft,
      publishedAt: task.autoPublish ? new Date() : null,
      siteIds: Array.isArray(task.targetSitesJson) ? (task.targetSitesJson as string[]) : []
    });

    await publishService.createJob(task.id, post.id, "success", "Mock scheduler executed and auto-generated post");
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
