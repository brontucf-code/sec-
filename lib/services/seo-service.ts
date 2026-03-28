import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

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
      .filter(Boolean);
  },

  async generateSitemapXml() {
    const rows = await prisma.post.findMany({
      where: { status: "published" },
      include: {
        category: true,
        regulator: true,
        postTags: { include: { tag: true } },
        postSites: { include: { site: true } }
      }
    });

    const urls = rows.flatMap((post) =>
      post.postSites.flatMap((ps) => {
        const base = `https://${ps.site.domain}`;
        const postUrl = `<url><loc>${base}/posts/${post.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`;
        const categoryUrl = post.category
          ? `<url><loc>${base}/categories/${post.category.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`
          : "";
        const regulatorUrl = post.regulator
          ? `<url><loc>${base}/regulators/${post.regulator.code}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`
          : "";
        const tagUrls = post.postTags.map(
          (pt) => `<url><loc>${base}/tags/${pt.tag.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`
        );
        return [postUrl, categoryUrl, regulatorUrl, ...tagUrls].filter(Boolean);
      })
    );

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Array.from(new Set(
      urls
    )).join("")}</urlset>`;
  }
};
