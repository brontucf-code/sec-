"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type PublishJob = { id: string; status: string; message?: string; createdAt: string };
type Task = {
  id: string;
  taskName: string;
  runTime: string;
  dailyCount: number;
  enabled: boolean;
  publishJobs?: PublishJob[];
};

export default function AutoPublishPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState({
    taskName: "每日 SEC 选题",
    enabled: true,
    runTime: "09:00",
    targetSites: [] as string[],
    language: "zh",
    dailyCount: 1,
    keywordSource: "Form D",
    articleType: "tutorial",
    autoPublish: true
  });

  const load = async () => setTasks(await (await fetch("/api/ai-tasks")).json());
  useEffect(() => {
    void load();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  return (
    <AdminLayout>
      <div className="card">
        <h1>自动发布任务</h1>
        <p className="hint">调度器每分钟检查一次 runTime（UTC）并自动生成文章到「文章管理」。</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/ai-tasks", { method: "POST", body: JSON.stringify(form) });
            await load();
          }}
        >
          <input placeholder="任务名称" value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} />
          <div className="grid2">
            <input placeholder="执行时间（UTC）" value={form.runTime} onChange={(e) => setForm({ ...form, runTime: e.target.value })} />
            <input placeholder="关键词来源" value={form.keywordSource} onChange={(e) => setForm({ ...form, keywordSource: e.target.value })} />
          </div>
          <div className="grid2">
            <input type="number" placeholder="日产量" value={form.dailyCount} onChange={(e) => setForm({ ...form, dailyCount: Number(e.target.value) })} />
            <select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}>
              <option value="question">问题类</option>
              <option value="tutorial">教程类</option>
              <option value="compare">对比类</option>
              <option value="longtail">长尾类</option>
            </select>
          </div>
          <label>目标站点</label>
          <select multiple value={form.targetSites} onChange={(e) => setForm({ ...form, targetSites: Array.from(e.target.selectedOptions).map((x) => x.value) })}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label className="inline-check"><input type="checkbox" checked={form.autoPublish} onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })} />自动发布</label>
          <button type="submit">新建</button>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>任务名</th><th>执行时间</th><th>日产量</th><th>执行状态</th><th>最近执行</th><th>操作</th></tr></thead>
          <tbody>
            {tasks.map((t) => {
              const lastJob = t.publishJobs?.[0];
              const statusText = !t.enabled ? "已停用" : lastJob?.status === "success" ? "执行成功" : lastJob?.status ? `执行异常(${lastJob.status})` : "待执行";
              return (
                <tr key={t.id}>
                  <td>{t.taskName}</td>
                  <td>{t.runTime} UTC</td>
                  <td>{t.dailyCount}</td>
                  <td>{statusText}</td>
                  <td>{lastJob ? `${new Date(lastJob.createdAt).toLocaleString()} / ${lastJob.message || "-"}` : "-"}</td>
                  <td>
                    <div className="actions-inline">
                      <button onClick={async () => { await fetch("/api/ai-tasks", { method: "PATCH", body: JSON.stringify({ id: t.id, action: "run-now" }) }); await load(); }}>发布</button>
                      <button className="btn-muted" onClick={async () => { await fetch("/api/ai-tasks", { method: "PATCH", body: JSON.stringify({ id: t.id, enabled: !t.enabled }) }); await load(); }}>{t.enabled ? "下线" : "发布"}</button>
                      <button className="btn-danger" onClick={async () => { await fetch(`/api/ai-tasks?id=${t.id}`, { method: "DELETE" }); await load(); }}>删除</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
