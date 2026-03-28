"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type DraftResult = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  faq: { question: string; answer: string }[];
  outline: string[];
  content: string;
};

export default function WritingPage() {
  const [sites, setSites] = useState<Site[]>([]);
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
  const [result, setResult] = useState<DraftResult | null>(null);
  const [lastSavedId, setLastSavedId] = useState("");

  useEffect(() => {
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const callWriting = async (action: "generate" | "save" | "publish") => {
    const res = await fetch("/api/writing", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        action,
        secondaryKeywords: form.secondaryKeywords.split(",").map((x) => x.trim())
      })
    });
    const data = await res.json();
    setResult(data.draft);
    setLastSavedId(data.post?.id || "");
  };

  return (
    <AdminLayout>
      <div className="grid2">
        <div className="card">
          <h1>AI Writing</h1>
          <form onSubmit={async (e) => { e.preventDefault(); await callWriting("generate"); }}>
            <input value={form.primaryKeyword} onChange={(e) => setForm({ ...form, primaryKeyword: e.target.value })} />
            <input value={form.secondaryKeywords} onChange={(e) => setForm({ ...form, secondaryKeywords: e.target.value })} />
            <div className="grid2">
              <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              <select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}>
                <option value="question">问题类</option>
                <option value="tutorial">教程类</option>
                <option value="compare">对比类</option>
                <option value="longtail">长尾类</option>
              </select>
            </div>
            <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            <input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
            <input value={form.wordRange} onChange={(e) => setForm({ ...form, wordRange: e.target.value })} />
            <label>发布站点（可多选）</label>
            <select
              multiple
              value={form.targetSites}
              onChange={(e) => setForm({ ...form, targetSites: Array.from(e.target.selectedOptions).map((x) => x.value) })}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="actions-inline">
              <button type="submit">生成文章</button>
              <button type="button" className="btn-muted" onClick={() => void callWriting("save")}>保存草稿</button>
              <button type="button" onClick={() => void callWriting("publish")}>一键发布</button>
            </div>
            {lastSavedId && <p className="hint">最近写入 Post ID: {lastSavedId}</p>}
          </form>
        </div>
        <div className="card">
          <h2>预览结果</h2>
          {!result && <p className="hint">先点击“生成文章”查看预览。</p>}
          {result && (
            <div>
              <h3>{result.title}</h3>
              <p><strong>SEO Title:</strong> {result.seoTitle}</p>
              <p><strong>SEO Description:</strong> {result.seoDescription}</p>
              <h4>Outline</h4>
              <ul>{result.outline?.map((x) => <li key={x}>{x}</li>)}</ul>
              <h4>FAQ</h4>
              <ul>{result.faq?.map((x) => <li key={x.question}><strong>{x.question}</strong>: {x.answer}</li>)}</ul>
              <h4>Content</h4>
              <pre>{result.content}</pre>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
