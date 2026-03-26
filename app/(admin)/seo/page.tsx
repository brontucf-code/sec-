import { AdminLayout } from "@/components/admin-layout";

export default function SeoPage() {
  return <AdminLayout><div className="card"><h1>SEO</h1><p>Sitemap: <a href="/api/seo/sitemap.xml" target="_blank">/api/seo/sitemap.xml</a></p></div></AdminLayout>;
}
