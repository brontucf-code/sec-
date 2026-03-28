"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type GeneratedResult = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  faq: Array<{ question: string; answer: string }>;
  outline: string[];
  content: string;
};

export default function WritingPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState({
    primaryKeyword: "Form D filing",
    secondaryKeywords: "Reg D,EDGAR",
    articleType: "tutorial",
    language: "en",
    tone: "professional",
    wordRange: "1200-1600",
    generateMeta: true,
    generateFaq: true,
    targetSites: [] as string[]
  });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/writing", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        audience: "compliance teams",
        secondaryKeywords: form.secondaryKeywords
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        generateTitle: true,
        generateMeta: form.generateMeta,
        generateFaq: form.generateFaq,
        generateOutline: true,
        generateBody: true
      })
    });
    setResult((await res.json()) as GeneratedResult);
  };

  const savePost = async (status: "draft" | "published") => {
    if (!result) return;
    setSaving(true);
    await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title: result.title,
        excerpt: result.seoDescription,
        content: result.content,
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        faq: result.faq,
        language: form.language,
        status,
        publishedAt: status === "published" ? new Date().toISOString() : null,
        siteIds: form.targetSites
      })
    });
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="grid2">
        <div className="card">
          <h1>AI Writing</h1>
          <form onSubmit={generate}>
            <label>主关键词</label>
            <input value={form.primaryKeyword} onChange={(e) => setForm({ ...form, primaryKeyword: e.target.value })} />
            <label>次关键词（逗号分隔）</label>
            <input value={form.secondaryKeywords} onChange={(e) => setForm({ ...form, secondaryKeywords: e.target.value })} />
            <label>文章类型</label>
            <select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}>
              <option value="question">问题类</option>
              <option value="tutorial">教程类</option>
              <option value="compare">对比类</option>
              <option value="longtail">长尾类</option>
            </select>
            <label>语言</label>
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            <label>语气</label>
            <input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
            <label>字数</label>
            <input value={form.wordRange} onChange={(e) => setForm({ ...form, wordRange: e.target.value })} />
            <label>
              <input
                type="checkbox"
                checked={form.generateMeta}
                onChange={(e) => setForm({ ...form, generateMeta: e.target.checked })}
              />
              生成 Meta
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.generateFaq}
                onChange={(e) => setForm({ ...form, generateFaq: e.target.checked })}
              />
              生成 FAQ
            </label>
            <label>目标站点</label>
            <select
              multiple
              value={form.targetSites}
              onChange={(e) =>
                setForm({ ...form, targetSites: Array.from(e.target.selectedOptions).map((item) => item.value) })
              }
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <button type="submit">生成内容</button>
          </form>
        </div>
        <div className="card">
          <h2>生成结果预览</h2>
          {result ? (
            <>
              <h3>{result.title}</h3>
              <p>{result.seoDescription}</p>
              <pre>{result.content}</pre>
              <pre>{JSON.stringify(result.faq, null, 2)}</pre>
              <button disabled={saving} onClick={() => void savePost("draft")}>
                一键保存为草稿
              </button>
              <button disabled={saving} onClick={() => void savePost("published")}>
                一键发布
              </button>
            </>
          ) : (
            <p>请先在左侧配置参数并生成。</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
