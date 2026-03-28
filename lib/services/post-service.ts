import { PostStatus, Prisma } from "@prisma/client";
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

function toPostData(input: CreatePostInput, id?: string): Prisma.PostCreateInput | Prisma.PostUpdateInput {
  const base = {
    title: input.title,
    slug: input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
    excerpt: input.excerpt,
    content: input.content,
    coverImage: input.coverImage,
    language: input.language,
    status: input.status,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    faq: input.faq as Prisma.InputJsonValue,
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    publishedAt: input.publishedAt
  };

  return {
    ...base,
    category: input.categoryId ? { connect: { id: input.categoryId } } : id ? { disconnect: true } : undefined,
    regulator: input.regulatorId ? { connect: { id: input.regulatorId } } : id ? { disconnect: true } : undefined,
    postSites: input.siteIds?.length
      ? {
          create: input.siteIds.map((siteId) => ({ site: { connect: { id: siteId } } }))
        }
      : undefined,
    postTags: input.tagIds?.length
      ? {
          create: input.tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } }))
        }
      : undefined
  };
}

export const postService = {
  list: () =>
    prisma.post.findMany({
      include: { postSites: { include: { site: true } }, category: true, regulator: true, postTags: true },
      orderBy: { createdAt: "desc" }
    }),

  async create(input: CreatePostInput) {
    return prisma.post.create({
      data: toPostData(input) as Prisma.PostCreateInput
    });
  },

  async update(id: string, input: CreatePostInput) {
    await prisma.postSite.deleteMany({ where: { postId: id } });
    await prisma.postTag.deleteMany({ where: { postId: id } });
    return prisma.post.update({
      where: { id },
      data: toPostData(input, id) as Prisma.PostUpdateInput
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
