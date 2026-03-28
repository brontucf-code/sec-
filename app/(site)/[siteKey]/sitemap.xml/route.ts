import { getSiteByKey } from "@/lib/site-frontend";
import { seoService } from "@/lib/services/seo-service";

export async function GET(_: Request, context: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await context.params;
  const site = await getSiteByKey(siteKey);
  if (!site) {
    return new Response("Not found", { status: 404 });
  }

  const xml = await seoService.generateSitemapXml(site.id);
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
