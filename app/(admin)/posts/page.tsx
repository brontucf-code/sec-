"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  faq: unknown;
  language: string;
  status: "draft" | "review" | "published" | "archived";
  publishedAt: string | null;
  postSites: Array<{ siteId: string; site: Site }>;
};

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  faq: string;
  language: string;
  status: "draft" | "review" | "published" | "archived";
  publishedAt: string;
};

const emptyForm: PostForm = {
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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => setPosts(await (await fetch("/api/posts")).json());

  useEffect(() => {
    void load();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const submitLabel = useMemo(() => (editingId ? "Update Post" : "Create Post"), [editingId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let faqValue: unknown = [];
    try {
      faqValue = form.faq.trim() ? JSON.parse(form.faq) : [];
    } catch {
      faqValue = [{ question: "Invalid FAQ JSON", answer: form.faq }];
    }

    const payload = {
      ...form,
      faq: faqValue,
      publishedAt: form.publishedAt || null,
      siteIds
    };

    if (editingId) {
      await fetch("/api/posts", { method: "PATCH", body: JSON.stringify({ id: editingId, ...payload }) });
    } else {
      await fetch("/api/posts", { method: "POST", body: JSON.stringify(payload) });
    }

    setForm(emptyForm);
    setSiteIds([]);
    setEditingId(null);
    await load();
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setSiteIds(post.postSites.map((item) => item.siteId));
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
      faq: JSON.stringify(post.faq ?? [], null, 2),
      language: post.language,
      status: post.status,
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : ""
    });
  };

  return (
    <AdminLayout>
      <div className="card">
        <h1>Posts</h1>
        <form onSubmit={handleSubmit}>
          <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input placeholder="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea placeholder="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} />
          <input placeholder="seoTitle" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <input
            placeholder="seoDescription"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
          <textarea
            placeholder='faq (JSON array, e.g. [{"question":"Q","answer":"A"}])'
            value={form.faq}
            onChange={(e) => setForm({ ...form, faq: e.target.value })}
            rows={4}
          />
          <input placeholder="language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PostForm["status"] })}>
            <option value="draft">draft</option>
            <option value="review">review</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
          <input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
          />

          <label>Target Sites</label>
          <select
            multiple
            value={siteIds}
            onChange={(e) => setSiteIds(Array.from(e.target.selectedOptions).map((x) => x.value))}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="submit">{submitLabel}</button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setSiteIds([]);
              }}
            >
              Cancel Edit
            </button>
          ) : null}
        </form>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Language</th>
              <th>Sites</th>
              <th>Published At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.slug}</td>
                <td>{p.status}</td>
                <td>{p.language}</td>
                <td>{p.postSites.map((item) => item.site.name).join(", ") || "-"}</td>
                <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleString() : "-"}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button
                    onClick={async () => {
                      await fetch("/api/posts", { method: "PATCH", body: JSON.stringify({ id: p.id, status: "published" }) });
                      await load();
                    }}
                  >
                    Publish
                  </button>
                  <button
                    onClick={async () => {
                      await fetch("/api/posts", { method: "PATCH", body: JSON.stringify({ id: p.id, status: "draft" }) });
                      await load();
                    }}
                  >
                    Unpublish
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/posts?id=${p.id}`, { method: "DELETE" });
                      await load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
