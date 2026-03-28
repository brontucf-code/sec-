import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { seoService } from "@/lib/services/seo-service";
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

function ensureSlug(inputSlug: string | undefined, title: string) {
  return inputSlug?.trim() ? slugify(inputSlug) : seoService.generateSlug(title);
}

function toPostData(input: CreatePostInput) {
  const { siteIds, tagIds, categoryId, regulatorId, ...base } = input;
  return {
    ...base,
    slug: ensureSlug(input.slug, input.title),
    seoTitle: input.seoTitle || seoService.generateSeoTitle(input.title),
    seoDescription: input.seoDescription || seoService.generateSeoDescription(input.excerpt || input.content),
    faq: input.faq as any,
    postSites: siteIds?.length ? { create: siteIds.map((siteId) => ({ siteId })) } : undefined,
    postTags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
    regulator: regulatorId ? { connect: { id: regulatorId } } : undefined
  };
}

export const postService = {
  list: () =>
    prisma.post.findMany({
      include: {
        postSites: { include: { site: true } },
        category: true,
        regulator: true,
        postTags: true
      },
      orderBy: { createdAt: "desc" }
    }),

  async create(input: CreatePostInput) {
    return prisma.post.create({ data: toPostData(input) });
  },

  async update(id: string, input: CreatePostInput) {
    await prisma.postSite.deleteMany({ where: { postId: id } });
    await prisma.postTag.deleteMany({ where: { postId: id } });
    return prisma.post.update({ where: { id }, data: toPostData(input) });
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
