"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Regulator = { id: string; name: string; code: string };
const emptyForm = { id: "", name: "", code: "" };

export default function Page() {
  const [rows, setRows] = useState<Regulator[]>([]);
  const [form, setForm] = useState(emptyForm);
  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const load = async () => setRows(await (await fetch("/api/regulators")).json());
  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminLayout>
      <div className="card">
        <h1>Regulators</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/regulators", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
            setForm(emptyForm);
            await load();
          }}
        >
          <input placeholder="监管机构名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="代码（如 SEC）" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <div className="actions-inline">
            <button type="submit">{editing ? "更新机构" : "新增机构"}</button>
            {editing && <button type="button" className="btn-muted" onClick={() => setForm(emptyForm)}>取消</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Code</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td><td>{row.code}</td>
                <td>
                  <div className="actions-inline">
                    <button className="btn-muted" onClick={() => setForm(row)}>编辑</button>
                    <button className="btn-danger" onClick={async () => { await fetch(`/api/regulators?id=${row.id}`, { method: "DELETE" }); await load(); }}>删除</button>
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
