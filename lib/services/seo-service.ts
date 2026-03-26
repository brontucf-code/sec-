import { prisma } from "@/lib/prisma";

export const seoService = {
  async generateSitemapXml() {
    const rows = await prisma.post.findMany({
      where: { status: "published" },
      include: { postSites: { include: { site: true } } }
    });

    const urls = rows.flatMap((post) =>
      post.postSites.map((ps) =>
        `<url><loc>https://${ps.site.domain}/posts/${post.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`
      )
    );

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
      ""
    )}</urlset>`;
  }
};
