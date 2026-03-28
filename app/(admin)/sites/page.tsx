"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = {
  id: string;
  name: string;
  siteKey: string;
  domain: string;
  defaultLanguage: string;
  isActive: boolean;
};

const emptyForm = { id: "", name: "", siteKey: "", domain: "", defaultLanguage: "zh", isActive: true };

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => setSites(await (await fetch("/api/sites")).json());
  useEffect(() => void load(), []);
  const editing = useMemo(() => Boolean(form.id), [form.id]);

  return (
    <AdminLayout>
      <div className="card">
        <h1>站点管理</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/sites", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
            setForm(emptyForm);
            await load();
          }}
        >
          <input placeholder="站点名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="站点标识（siteKey）" value={form.siteKey} onChange={(e) => setForm({ ...form, siteKey: e.target.value })} required />
          <input placeholder="站点域名" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
          <input
            placeholder="默认语言"
            value={form.defaultLanguage}
            onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
          />
          <label className="inline-check">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />启用站点
          </label>
          <div className="actions-inline">
            <button type="submit">{editing ? "保存" : "新建"}</button>
            {editing && (
              <button className="btn-muted" type="button" onClick={() => setForm(emptyForm)}>
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
              <th>站点名称</th>
              <th>站点标识</th>
              <th>域名</th>
              <th>默认语言</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.siteKey}</td>
                <td>{s.domain}</td>
                <td>{s.defaultLanguage}</td>
                <td>{s.isActive ? "运行中" : "已停用"}</td>
                <td>
                  <div className="actions-inline">
                    <button className="btn-muted" onClick={() => setForm(s)}>编辑</button>
                    <button
                      onClick={async () => {
                        await fetch("/api/sites", { method: "PUT", body: JSON.stringify({ ...s, isActive: !s.isActive }) });
                        await load();
                      }}
                    >
                      {s.isActive ? "下线" : "发布"}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        await fetch(`/api/sites?id=${s.id}`, { method: "DELETE" });
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
