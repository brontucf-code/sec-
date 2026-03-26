"use client";
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

export default function WritingPage() {
  const [form, setForm] = useState({
    primaryKeyword: "Form D filing",
    secondaryKeywords: "Reg D,EDGAR",
    language: "en",
    articleType: "tutorial",
    audience: "fund managers",
    tone: "professional",
    wordRange: "1200-1600",
    generateTitle: true,
    generateMeta: true,
    generateFaq: true,
    generateOutline: true,
    generateBody: true,
    targetSites: [] as string[]
  });
  const [result, setResult] = useState<string>("");

  return (
    <AdminLayout>
      <div className="grid2">
        <div className="card">
          <h1>AI Writing</h1>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/writing", { method: "POST", body: JSON.stringify({
              ...form,
              secondaryKeywords: form.secondaryKeywords.split(",").map((x) => x.trim())
            })});
            setResult(JSON.stringify(await res.json(), null, 2));
          }}>
            <input value={form.primaryKeyword} onChange={(e) => setForm({ ...form, primaryKeyword: e.target.value })} />
            <input value={form.secondaryKeywords} onChange={(e) => setForm({ ...form, secondaryKeywords: e.target.value })} />
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            <select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}><option value="question">问题类</option><option value="tutorial">教程类</option><option value="compare">对比类</option><option value="longtail">长尾类</option></select>
            <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            <input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
            <input value={form.wordRange} onChange={(e) => setForm({ ...form, wordRange: e.target.value })} />
            <button type="submit">Generate</button>
          </form>
        </div>
        <div className="card">
          <h2>Result</h2>
          <pre>{result}</pre>
        </div>
      </div>
    </AdminLayout>
  );
}
