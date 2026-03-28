"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type Regulator = { id: string; name: string; code: string };

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  language: string;
  status: "draft" | "review" | "published" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string | null;
  regulatorId?: string | null;
  postSites: { siteId: string; site: Site }[];
  postTags: { tagId: string }[];
};

const emptyForm = {
  id: "",
  title: "",
  content: "",
  language: "en",
  status: "draft" as Post["status"],
  seoTitle: "",
  seoDescription: "",
  categoryId: "",
  regulatorId: ""
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [regulators, setRegulators] = useState<Regulator[]>([]);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({ keyword: "", status: "all", siteId: "all" });
  const [form, setForm] = useState(emptyForm);

  const load = async (query = filters) => {
    const params = new URLSearchParams();
    if (query.keyword.trim()) params.set("keyword", query.keyword.trim());
    if (query.status !== "all") params.set("status", query.status);
    if (query.siteId !== "all") params.set("siteId", query.siteId);
    const url = params.toString() ? `/api/posts?${params.toString()}` : "/api/posts";
    setPosts(await (await fetch(url)).json());
  };

  useEffect(() => {
    void load();
    void (async () => {
      const [siteRows, categoryRows, tagRows, regulatorRows] = await Promise.all([
        fetch("/api/sites").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/tags").then((r) => r.json()),
        fetch("/api/regulators").then((r) => r.json())
      ]);
      setSites(siteRows);
      setCategories(categoryRows);
      setTags(tagRows);
      setRegulators(regulatorRows);
    })();
  }, []);

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      categoryId: form.categoryId || null,
      regulatorId: form.regulatorId || null,
      siteIds,
      tagIds
    };
    await fetch("/api/posts", { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) });
    setForm(emptyForm);
    setSiteIds([]);
    setTagIds([]);
    await load();
  };

  return (
    <AdminLayout>
      <div className="card">
        <h1>Posts</h1>
        <form onSubmit={submit}>
          <input placeholder="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="正文内容" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required />
          <div className="grid2">
            <div>
              <label>语言</label>
              <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div>
              <label>状态</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Post["status"] })}>
                <option value="draft">draft</option>
                <option value="review">review</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>
          <div className="grid2">
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">无分类</option>
              {categories.map((row) => (
                <option key={row.id} value={row.id}>{row.name}</option>
              ))}
            </select>
            <select value={form.regulatorId} onChange={(e) => setForm({ ...form, regulatorId: e.target.value })}>
              <option value="">无监管机构</option>
              {regulators.map((row) => (
                <option key={row.id} value={row.id}>{row.code} - {row.name}</option>
              ))}
            </select>
          </div>
          <input placeholder="SEO Title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <textarea
            placeholder="SEO Description"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            rows={2}
          />
          <label>绑定站点（可多选）</label>
          <select multiple value={siteIds} onChange={(e) => setSiteIds(Array.from(e.target.selectedOptions).map((x) => x.value))}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label>绑定标签（可多选）</label>
          <select multiple value={tagIds} onChange={(e) => setTagIds(Array.from(e.target.selectedOptions).map((x) => x.value))}>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
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
                  setTagIds([]);
                }}
              >
                取消编辑
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>搜索和筛选</h2>
        <div className="grid2">
          <input
            placeholder="搜索标题 / slug / 内容"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">全部状态</option>
            <option value="draft">draft</option>
            <option value="review">review</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
          <select value={filters.siteId} onChange={(e) => setFilters({ ...filters, siteId: e.target.value })}>
            <option value="all">全部站点</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="actions-inline">
            <button type="button" onClick={() => void load(filters)}>
              应用筛选
            </button>
            <button
              type="button"
              className="btn-muted"
              onClick={() => {
                const next = { keyword: "", status: "all", siteId: "all" };
                setFilters(next);
                void load(next);
              }}
            >
              清空
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>标题</th>
              <th>Slug</th>
              <th>状态</th>
              <th>站点</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.slug}</td>
                <td>{p.status}</td>
                <td>{p.postSites.map((s) => s.site.name).join(", ") || "-"}</td>
                <td>
                  <div className="actions-inline">
                    <button
                      type="button"
                      className="btn-muted"
                      onClick={() => {
                        setForm({
                          id: p.id,
                          title: p.title,
                          content: p.content,
                          language: p.language,
                          status: p.status,
                          seoTitle: p.seoTitle || "",
                          seoDescription: p.seoDescription || "",
                          categoryId: p.categoryId || "",
                          regulatorId: p.regulatorId || ""
                        });
                        setSiteIds(p.postSites.map((x) => x.siteId));
                        setTagIds(p.postTags.map((x) => x.tagId));
                      }}
                    >
                      编辑
                    </button>
                    {(["draft", "review", "published", "archived"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={p.status === status ? "btn-muted" : ""}
                        onClick={async () => {
                          await fetch("/api/posts", { method: "PATCH", body: JSON.stringify({ id: p.id, status }) });
                          await load();
                        }}
                      >
                        {status}
                      </button>
                    ))}
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
