import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type CreatePostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  language?: string;
  status?: PostStatus;
  seoTitle?: string;
  seoDescription?: string;
  faq?: unknown;
  sourceName?: string;
  sourceUrl?: string;
  publishedAt?: Date | null;
  categoryId?: string | null;
  regulatorId?: string | null;
  siteIds?: string[];
  tagIds?: string[];
};

export const postService = {
  list: () =>
    prisma.post.findMany({
      include: { postSites: { include: { site: true } }, category: true, regulator: true, postTags: true },
      orderBy: { createdAt: "desc" }
    }),

  async create(input: CreatePostInput) {
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
    return prisma.post.create({
      data: {
        ...input,
        slug,
        postSites: input.siteIds?.length ? { create: input.siteIds.map((siteId) => ({ siteId })) } : undefined,
        postTags: input.tagIds?.length ? { create: input.tagIds.map((tagId) => ({ tagId })) } : undefined
      }
    });
  },

  async update(id: string, input: CreatePostInput) {
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
    await prisma.postSite.deleteMany({ where: { postId: id } });
    await prisma.postTag.deleteMany({ where: { postId: id } });
    return prisma.post.update({
      where: { id },
      data: {
        ...input,
        slug,
        postSites: input.siteIds?.length ? { create: input.siteIds.map((siteId) => ({ siteId })) } : undefined,
        postTags: input.tagIds?.length ? { create: input.tagIds.map((tagId) => ({ tagId })) } : undefined
      }
    });
  },

  remove: (id: string) => prisma.post.delete({ where: { id } }),
  setStatus: (id: string, status: PostStatus) =>
    prisma.post.update({ where: { id }, data: { status, publishedAt: status === "published" ? new Date() : null } }),
  relatedBySite: (siteId: string, excludePostId: string) =>
    prisma.post.findMany({
      where: { id: { not: excludePostId }, postSites: { some: { siteId } }, status: "published" },
      take: 5,
      orderBy: { publishedAt: "desc" }
    })
};
