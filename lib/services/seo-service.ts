import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

export const seoService = {
  generateSlug(title: string) {
    return slugify(title);
  },

  generateSeoTitle(title: string) {
    return `${title.slice(0, 55)} | SEC Content Hub`;
  },

  generateSeoDescription(content: string) {
    const plain = content.replace(/[#*`\n>-]/g, " ").replace(/\s+/g, " ").trim();
    return plain.slice(0, 155);
  },

  async generateRelated(siteId: string, excludePostId: string) {
    return prisma.post.findMany({
      where: { status: "published", id: { not: excludePostId }, postSites: { some: { siteId } } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, publishedAt: true }
    });
  },

  normalizeFaq(faq?: unknown) {
    if (!Array.isArray(faq)) return [];
    return faq
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const q = String((item as { question?: unknown }).question ?? "").trim();
        const a = String((item as { answer?: unknown }).answer ?? "").trim();
        if (!q || !a) return null;
        return { question: q, answer: a };
      })
      .filter((item): item is { question: string; answer: string } => Boolean(item));
  },

  async generateSitemapXml(siteId?: string) {
    const sites = await prisma.site.findMany({
      where: siteId ? { id: siteId } : undefined,
      select: { id: true, domain: true }
    });

    const [posts, categories, tags, regulators] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published", postSites: siteId ? { some: { siteId } } : undefined },
        include: { postSites: { include: { site: true } } }
      }),
      prisma.category.findMany({ include: { posts: { include: { postSites: { include: { site: true } } } } } }),
      prisma.tag.findMany({ include: { postTags: { include: { post: { include: { postSites: { include: { site: true } } } } } } } }),
      prisma.regulator.findMany({ include: { posts: { include: { postSites: { include: { site: true } } } } } })
    ]);

    const siteDomainSet = new Set(sites.map((site) => site.domain));

    const urls = new Map<string, string>();
    const pushUrl = (loc: string, lastmod?: Date) => {
      if (!loc) return;
      const value = `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""}</url>`;
      urls.set(loc, value);
    };

    posts.forEach((post) => {
      post.postSites.forEach((postSite) => {
        if (siteDomainSet.size && !siteDomainSet.has(postSite.site.domain)) return;
        pushUrl(`https://${postSite.site.domain}/posts/${post.slug}`, post.updatedAt);
      });
    });

    sites.forEach((site) => {
      pushUrl(`https://${site.domain}`);
      pushUrl(`https://${site.domain}/posts`);
      pushUrl(`https://${site.domain}/categories`);
      pushUrl(`https://${site.domain}/tags`);
      pushUrl(`https://${site.domain}/regulators`);
    });

    categories.forEach((category) => {
      category.posts.forEach((post) => {
        if (post.status !== "published") return;
        post.postSites.forEach((postSite) => {
          if (siteDomainSet.size && !siteDomainSet.has(postSite.site.domain)) return;
          pushUrl(`https://${postSite.site.domain}/categories/${category.slug}`, post.updatedAt);
        });
      });
    });

    tags.forEach((tag) => {
      tag.postTags.forEach((postTag) => {
        if (postTag.post.status !== "published") return;
        postTag.post.postSites.forEach((postSite) => {
          if (siteDomainSet.size && !siteDomainSet.has(postSite.site.domain)) return;
          pushUrl(`https://${postSite.site.domain}/tags/${tag.slug}`, postTag.post.updatedAt);
        });
      });
    });

    regulators.forEach((regulator) => {
      regulator.posts.forEach((post) => {
        if (post.status !== "published") return;
        post.postSites.forEach((postSite) => {
          if (siteDomainSet.size && !siteDomainSet.has(postSite.site.domain)) return;
          pushUrl(`https://${postSite.site.domain}/regulators/${regulator.code}`, post.updatedAt);
        });
      });
    });

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...urls.values()].join("")}</urlset>`;
  }
};
