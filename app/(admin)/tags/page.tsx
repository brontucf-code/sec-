"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Tag = { id: string; name: string; slug: string };
const emptyForm = { id: "", name: "", slug: "" };

export default function Page() {
  const [rows, setRows] = useState<Tag[]>([]);
  const [form, setForm] = useState(emptyForm);
  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const load = async () => setRows(await (await fetch("/api/tags")).json());
  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminLayout>
      <div className="card">
        <h1>Tags</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/tags", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
            setForm(emptyForm);
            await load();
          }}
        >
          <input placeholder="标签名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="slug（可选）" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div className="actions-inline">
            <button type="submit">{editing ? "更新标签" : "新增标签"}</button>
            {editing && <button type="button" className="btn-muted" onClick={() => setForm(emptyForm)}>取消</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Slug</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td><td>{row.slug}</td>
                <td>
                  <div className="actions-inline">
                    <button className="btn-muted" onClick={() => setForm(row)}>编辑</button>
                    <button className="btn-danger" onClick={async () => { await fetch(`/api/tags?id=${row.id}`, { method: "DELETE" }); await load(); }}>删除</button>
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
