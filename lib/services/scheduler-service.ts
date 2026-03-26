import cron from "node-cron";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { aiWriterService } from "@/lib/services/ai-writer-service";
import { postService } from "@/lib/services/post-service";
import { publishService } from "@/lib/services/publish-service";
import { slugify } from "@/lib/utils";

let started = false;

export const schedulerService = {
  start() {
    if (started) return;
    started = true;
    cron.schedule("*/5 * * * *", async () => {
      const tasks = await prisma.aiTask.findMany({ where: { enabled: true } });

      for (const task of tasks) {
        const keywords = [`SEC ${task.keywordSource}`, `Reg D ${task.keywordSource}`].slice(0, task.dailyCount);
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
            content: draft.content,
            seoTitle: draft.seoTitle,
            seoDescription: draft.seoDescription,
            faq: draft.faq,
            language: task.language,
            status: task.autoPublish ? PostStatus.published : PostStatus.draft,
            publishedAt: task.autoPublish ? new Date() : null,
            siteIds: Array.isArray(task.targetSitesJson) ? (task.targetSitesJson as string[]) : []
          });

          await publishService.createJob(task.id, post.id, "success", "Mock scheduler executed");
        }
      }
    });
  }
};
