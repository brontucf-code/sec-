"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string; siteKey: string; domain: string; defaultLanguage: string; isActive: boolean };

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState({ name: "", siteKey: "", domain: "", defaultLanguage: "en", isActive: true });

  const load = async () => setSites(await (await fetch("/api/sites")).json());
  useEffect(() => void load(), []);

  return (
    <AdminLayout>
      <div className="card">
        <h1>Sites</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/sites", { method: "POST", body: JSON.stringify(form) });
            setForm({ name: "", siteKey: "", domain: "", defaultLanguage: "en", isActive: true });
            await load();
          }}
        >
          <input placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="siteKey" value={form.siteKey} onChange={(e) => setForm({ ...form, siteKey: e.target.value })} />
          <input placeholder="domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
          <button type="submit">Create Site</button>
        </form>
      </div>
      <div className="card">
        <table><thead><tr><th>Name</th><th>Key</th><th>Domain</th><th>Actions</th></tr></thead><tbody>
          {sites.map((s) => (
            <tr key={s.id}><td>{s.name}</td><td>{s.siteKey}</td><td>{s.domain}</td><td><button onClick={async()=>{await fetch(`/api/sites?id=${s.id}`,{method:"DELETE"});await load();}}>Delete</button></td></tr>
          ))}
        </tbody></table>
      </div>
    </AdminLayout>
  );
}
