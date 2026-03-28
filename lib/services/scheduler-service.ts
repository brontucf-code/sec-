import cron from "node-cron";
import { AiTask, PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { aiWriterService } from "@/lib/services/ai-writer-service";
import { postService } from "@/lib/services/post-service";
import { publishService } from "@/lib/services/publish-service";
import { slugify } from "@/lib/utils";

let started = false;

function toKeywords(keywordSource: string, dailyCount: number) {
  const pool = keywordSource
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!pool.length) return ["SEC filing"];
  return pool.slice(0, Math.max(1, dailyCount));
}

async function executeTask(task: AiTask) {
  const keywords = toKeywords(task.keywordSource, task.dailyCount);

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
      slug: slugify(draft.title),
      excerpt: draft.seoDescription,
      content: draft.content,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      faq: draft.faq,
      language: task.language,
      status: task.autoPublish ? PostStatus.published : PostStatus.draft,
      publishedAt: task.autoPublish ? new Date() : null,
      siteIds: Array.isArray(task.targetSitesJson) ? (task.targetSitesJson as string[]) : []
    });

    await publishService.createJob(task.id, post.id, "success", `Mock scheduler executed for ${keyword}`);
  }
}

export const schedulerService = {
  start() {
    if (started) return;
    started = true;
    cron.schedule("*/5 * * * *", async () => {
      const tasks = await prisma.aiTask.findMany({ where: { enabled: true } });
      for (const task of tasks) {
        await executeTask(task);
      }
    });
  },

  async runTaskNow(taskId: string) {
    const task = await prisma.aiTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");
    await executeTask(task);
    return { ok: true, taskId };
  }
};
