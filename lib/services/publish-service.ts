import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { postService } from "@/lib/services/post-service";

export const publishService = {
  publish: (postId: string) => postService.setStatus(postId, PostStatus.published),
  archive: (postId: string) => postService.setStatus(postId, PostStatus.archived),
  createJob: (taskId: string, postId: string | null, status = "created", message?: string) =>
    prisma.publishJob.create({ data: { taskId, postId, status, message } })
};
