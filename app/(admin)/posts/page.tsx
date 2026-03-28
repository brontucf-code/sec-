"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  language: string;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  faq?: unknown;
  publishedAt?: string | null;
  postSites: { siteId: string; site: Site }[];
};

type PostForm = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  faq: string;
  language: string;
  status: string;
  publishedAt: string;
};

const emptyForm: PostForm = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  faq: "",
  language: "en",
  status: "draft",
  publishedAt: ""
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  return localIso.slice(0, 16);
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [faqError, setFaqError] = useState("");

  const load = async () => setPosts(await (await fetch("/api/posts")).json());

  useEffect(() => {
    void load();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    let parsedFaq: unknown;
    if (form.faq.trim()) {
      try {
        parsedFaq = JSON.parse(form.faq);
      } catch {
        setFaqError("FAQ 必须是合法 JSON");
        return;
      }
    }

    setFaqError("");
    const payload = {
      ...form,
      faq: parsedFaq,
      siteIds,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null
    };

    await fetch("/api/posts", {
      method: editing ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });

    setForm(emptyForm);
    setSiteIds([]);
    await load();
  };

  return (
    <AdminLayout>
      <div className="card">
        <h1>Posts</h1>
        <form onSubmit={submit}>
          <input
            placeholder="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Slug（可选，留空自动生成）"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <textarea
            placeholder="摘要"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={2}
          />
          <textarea
            placeholder="正文内容"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={8}
            required
          />

          <input
            placeholder="SEO Title"
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          />
          <textarea
            placeholder="SEO Description"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            rows={2}
          />

          <textarea
            placeholder='FAQ(JSON)，例如 [{"question":"Q1","answer":"A1"}]'
            value={form.faq}
            onChange={(e) => setForm({ ...form, faq: e.target.value })}
            rows={3}
          />
          {faqError && <p className="hint" style={{ color: "#e53e3e" }}>{faqError}</p>}

          <div className="grid2">
            <div>
              <label>语言</label>
              <input
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              />
            </div>
            <div>
              <label>状态</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">draft</option>
                <option value="review">review</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>

          <div>
            <label>发布时间</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
          </div>

          <label>绑定站点（可多选）</label>
          <select
            multiple
            value={siteIds}
            onChange={(e) =>
              setSiteIds(Array.from(e.target.selectedOptions).map((x) => x.value))
            }
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="actions-inline">
            <button type="submit">{editing ? "更新 Post" : "创建 Post"}</button>
            {editing && (
              <button
                type="button"
                className="btn-muted"
                onClick={() => {
                  setForm(emptyForm);
                  setSiteIds([]);
                  setFaqError("");
                }}
              >
                取消编辑
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>标题</th>
              <th>状态</th>
              <th>语言</th>
              <th>站点数量</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.status}</td>
                <td>{p.language}</td>
                <td>{p.postSites.length}</td>
                <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleString() : "-"}</td>
                <td>
                  <div className="actions-inline">
                    <button
                      type="button"
                      className="btn-muted"
                      onClick={() => {
                        setForm({
                          id: p.id,
                          title: p.title,
                          slug: p.slug,
                          excerpt: p.excerpt || "",
                          content: p.content,
                          seoTitle: p.seoTitle || "",
                          seoDescription: p.seoDescription || "",
                          faq: p.faq ? JSON.stringify(p.faq, null, 2) : "",
                          language: p.language,
                          status: p.status,
                          publishedAt: toInputDate(p.publishedAt)
                        });
                        setSiteIds(p.postSites.map((x) => x.siteId));
                      }}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/posts", {
                          method: "PATCH",
                          body: JSON.stringify({ id: p.id, status: "published" })
                        });
                        await load();
                      }}
                    >
                      发布
                    </button>
                    <button
                      type="button"
                      className="btn-muted"
                      onClick={async () => {
                        await fetch("/api/posts", {
                          method: "PATCH",
                          body: JSON.stringify({ id: p.id, status: "draft" })
                        });
                        await load();
                      }}
                    >
                      下线
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={async () => {
                        await fetch(`/api/posts?id=${p.id}`, { method: "DELETE" });
                        await load();
                      }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
