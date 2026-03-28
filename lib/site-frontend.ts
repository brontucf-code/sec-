import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const publishedPostInclude = {
  category: true,
  regulator: true,
  postTags: { include: { tag: true } }
} satisfies Prisma.PostInclude;

export const SEO_CHANNELS = [
  { key: "sec", label: "SEC", href: "/topics/sec" },
  { key: "form-d", label: "Form D", href: "/topics/form-d" },
  { key: "edgar", label: "EDGAR", href: "/topics/edgar" },
  { key: "ria-era", label: "RIA / ERA", href: "/topics/ria-era" }
] as const;

export async function getSiteByKey(siteKey: string) {
  return prisma.site.findUnique({ where: { siteKey } });
}

export async function getPublishedPostBySlug(siteId: string, slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: "published", postSites: { some: { siteId } } },
    include: publishedPostInclude
  });
}

export async function getLatestPublishedPosts(siteId: string, take = 10) {
  return prisma.post.findMany({
    where: { status: "published", postSites: { some: { siteId } } },
    include: publishedPostInclude,
    orderBy: { publishedAt: "desc" },
    take
  });
}

export async function getPostsByCategory(siteId: string, categorySlug: string) {
  return prisma.post.findMany({
    where: {
      status: "published",
      category: { slug: categorySlug },
      postSites: { some: { siteId } }
    },
    include: publishedPostInclude,
    orderBy: { publishedAt: "desc" }
  });
}

export async function getPostsByTag(siteId: string, tagSlug: string) {
  return prisma.post.findMany({
    where: {
      status: "published",
      postTags: { some: { tag: { slug: tagSlug } } },
      postSites: { some: { siteId } }
    },
    include: publishedPostInclude,
    orderBy: { publishedAt: "desc" }
  });
}

export async function getPostsByRegulator(siteId: string, regulatorCode: string) {
  return prisma.post.findMany({
    where: {
      status: "published",
      regulator: { code: regulatorCode },
      postSites: { some: { siteId } }
    },
    include: publishedPostInclude,
    orderBy: { publishedAt: "desc" }
  });
}

export async function getSiteFacets(siteId: string) {
  const [categories, tags, regulators] = await Promise.all([
    prisma.category.findMany({
      where: { posts: { some: { status: "published", postSites: { some: { siteId } } } } },
      orderBy: { name: "asc" }
    }),
    prisma.tag.findMany({
      where: { postTags: { some: { post: { status: "published", postSites: { some: { siteId } } } } } },
      orderBy: { name: "asc" }
    }),
    prisma.regulator.findMany({
      where: { posts: { some: { status: "published", postSites: { some: { siteId } } } } },
      orderBy: { name: "asc" }
    })
  ]);

  return { categories, tags, regulators };
}
