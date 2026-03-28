"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Post = { id: string; title: string; content: string; seoTitle?: string; seoDescription?: string; faq?: any; postSites: { siteId: string; site: { name: string } }[]; slug: string };

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function SeoPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    void (async () => {
      const data = await (await fetch("/api/posts")).json();
      setPosts(data);
      if (data[0]?.id) setSelectedId(data[0].id);
    })();
  }, []);

  const current = useMemo(() => posts.find((p) => p.id === selectedId), [posts, selectedId]);
  const seoTitle = current?.seoTitle || `${current?.title || ""} | SEC Content Hub`;
  const seoDescription = current?.seoDescription || (current?.content || "").slice(0, 155);
  const related = posts.filter((p) => p.id !== current?.id && p.postSites.some((s) => current?.postSites.some((x) => x.siteId === s.siteId))).slice(0, 5);

  return (
    <AdminLayout>
      <div className="card">
        <h1>SEO</h1>
        <p>Sitemap: <a href="/api/seo/sitemap.xml" target="_blank">/api/seo/sitemap.xml</a></p>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {posts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {current && (
        <div className="grid2">
          <div className="card">
            <h3>基础 SEO</h3>
            <p><strong>Auto Slug:</strong> {slugify(current.title)}</p>
            <p><strong>SEO Title:</strong> {seoTitle}</p>
            <p><strong>SEO Description:</strong> {seoDescription}</p>
          </div>
          <div className="card">
            <h3>相关推荐</h3>
            <ul>{related.map((r) => <li key={r.id}>{r.title} ({r.slug})</li>)}</ul>
            <h3>FAQ 输出位</h3>
            <pre>{JSON.stringify(current.faq || [], null, 2)}</pre>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
