import { seoService } from "@/lib/services/seo-service";

export async function GET() {
  const xml = await seoService.generateSitemapXml();
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
