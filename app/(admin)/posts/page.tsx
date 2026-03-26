"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Post = { id: string; title: string; status: string; slug: string };

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [form, setForm] = useState({ title: "", content: "", language: "en", status: "draft" });

  const load = async () => setPosts(await (await fetch("/api/posts")).json());
  useEffect(() => {
    void load();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  return (
    <AdminLayout>
      <div className="card">
        <h1>Posts</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/posts", { method: "POST", body: JSON.stringify({ ...form, siteIds }) });
            setForm({ title: "", content: "", language: "en", status: "draft" });
            await load();
          }}
        >
          <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <label>Target Sites</label>
          <select multiple value={siteIds} onChange={(e) => setSiteIds(Array.from(e.target.selectedOptions).map((x) => x.value))}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button type="submit">Create Post</button>
        </form>
      </div>
      <div className="card">
        <table><thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {posts.map((p) => (
            <tr key={p.id}><td>{p.title}</td><td>{p.slug}</td><td>{p.status}</td><td>
              <button onClick={async()=>{await fetch('/api/posts',{method:'PATCH',body:JSON.stringify({id:p.id,status:'published'})});await load();}}>Publish</button>
              <button onClick={async()=>{await fetch('/api/posts',{method:'PATCH',body:JSON.stringify({id:p.id,status:'archived'})});await load();}}>Archive</button>
              <button onClick={async()=>{await fetch(`/api/posts?id=${p.id}`,{method:'DELETE'});await load();}}>Delete</button>
            </td></tr>
          ))}
        </tbody></table>
      </div>
    </AdminLayout>
  );
}
