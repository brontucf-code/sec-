"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  language: string;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  postSites: { siteId: string; site: Site }[];
};

const emptyForm = { id: "", title: "", content: "", language: "zh", status: "draft", seoTitle: "", seoDescription: "" };

const statusLabelMap: Record<string, string> = {
  draft: "草稿",
  review: "待审核",
  published: "已发布",
  archived: "已下线"
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => setPosts(await (await fetch("/api/posts")).json());
  useEffect(() => {
    void load();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, siteIds };
    await fetch("/api/posts", { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) });
    setForm(emptyForm);
    setSiteIds([]);
    await load();
  };

  const quickUpdateStatus = async (id: string, status: "published" | "archived") => {
    await fetch("/api/posts", { method: "PATCH", body: JSON.stringify({ id, status }) });
    await load();
  };

  return (
    <AdminLayout>
      <div className="card">
        <h1>文章管理</h1>
        <form onSubmit={submit}>
          <input placeholder="文章标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="正文内容" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required />
          <div className="grid2">
            <div>
              <label>语言</label>
              <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div>
              <label>状态</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">草稿</option>
                <option value="review">待审核</option>
                <option value="published">已发布</option>
                <option value="archived">已下线</option>
              </select>
            </div>
          </div>
          <input placeholder="SEO 标题" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <textarea placeholder="SEO 描述" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={2} />
          <label>绑定站点（可多选）</label>
          <select multiple value={siteIds} onChange={(e) => setSiteIds(Array.from(e.target.selectedOptions).map((x) => x.value))}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="actions-inline">
            <button type="submit">{editing ? "保存" : "新建"}</button>
            {editing && (
              <button
                type="button"
                className="btn-muted"
                onClick={() => {
                  setForm(emptyForm);
                  setSiteIds([]);
                }}
              >
                取消
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
              <th>Slug</th>
              <th>状态</th>
              <th>站点</th>
              <th>快捷操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.slug}</td>
                <td>{statusLabelMap[p.status] || p.status}</td>
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
                          seoDescription: p.seoDescription || ""
                        });
                        setSiteIds(p.postSites.map((x) => x.siteId));
                      }}
                    >
                      编辑
                    </button>
                    <button type="button" onClick={async () => quickUpdateStatus(p.id, "published")}>发布</button>
                    <button type="button" className="btn-muted" onClick={async () => quickUpdateStatus(p.id, "archived")}>下线</button>
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
