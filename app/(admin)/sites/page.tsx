"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = {
  id: string;
  name: string;
  siteKey: string;
  domain: string;
  logo: string | null;
  themeColor: string | null;
  defaultLanguage: string;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
};

type SiteForm = {
  name: string;
  siteKey: string;
  domain: string;
  logo: string;
  themeColor: string;
  defaultLanguage: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
};

const emptyForm: SiteForm = {
  name: "",
  siteKey: "",
  domain: "",
  logo: "",
  themeColor: "#1d4ed8",
  defaultLanguage: "en",
  seoTitle: "",
  seoDescription: "",
  isActive: true
};

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState<SiteForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => setSites(await (await fetch("/api/sites")).json());
  useEffect(() => void load(), []);

  const submitLabel = useMemo(() => (editingId ? "Update Site" : "Create Site"), [editingId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch("/api/sites", { method: "PUT", body: JSON.stringify({ id: editingId, ...form }) });
    } else {
      await fetch("/api/sites", { method: "POST", body: JSON.stringify(form) });
    }
    setForm(emptyForm);
    setEditingId(null);
    await load();
  };

  return (
    <AdminLayout>
      <div className="card">
        <h1>Sites</h1>
        <form onSubmit={submit}>
          <input placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="siteKey" value={form.siteKey} onChange={(e) => setForm({ ...form, siteKey: e.target.value })} />
          <input placeholder="domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
          <input placeholder="logo" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
          <input
            placeholder="themeColor"
            value={form.themeColor}
            onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
          />
          <input
            placeholder="defaultLanguage"
            value={form.defaultLanguage}
            onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
          />
          <input placeholder="seoTitle" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <input
            placeholder="seoDescription"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
          <label>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            isActive
          </label>
          <button type="submit">{submitLabel}</button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
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
              <th>Name</th>
              <th>Key</th>
              <th>Domain</th>
              <th>Default Lang</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.siteKey}</td>
                <td>{s.domain}</td>
                <td>{s.defaultLanguage}</td>
                <td>{s.isActive ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingId(s.id);
                      setForm({
                        name: s.name,
                        siteKey: s.siteKey,
                        domain: s.domain,
                        logo: s.logo ?? "",
                        themeColor: s.themeColor ?? "",
                        defaultLanguage: s.defaultLanguage,
                        seoTitle: s.seoTitle ?? "",
                        seoDescription: s.seoDescription ?? "",
                        isActive: s.isActive
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/sites?id=${s.id}`, { method: "DELETE" });
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
