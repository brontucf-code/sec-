"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };

export default function AutoPublishPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState({
    taskName: "Daily SEC",
    enabled: true,
    runTime: "09:00",
    targetSites: [] as string[],
    language: "en",
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
        <h1>Auto Publish</h1>
        <p className="hint">Mock 定时器每分钟检查一次 runTime（UTC）并生成文章到 Posts。</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/ai-tasks", { method: "POST", body: JSON.stringify(form) });
            await load();
          }}
        >
          <input value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} />
          <div className="grid2">
            <input value={form.runTime} onChange={(e) => setForm({ ...form, runTime: e.target.value })} />
            <input value={form.keywordSource} onChange={(e) => setForm({ ...form, keywordSource: e.target.value })} />
          </div>
          <div className="grid2">
            <input type="number" value={form.dailyCount} onChange={(e) => setForm({ ...form, dailyCount: Number(e.target.value) })} />
            <select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}>
              <option value="question">question</option>
              <option value="tutorial">tutorial</option>
              <option value="compare">compare</option>
              <option value="longtail">longtail</option>
            </select>
          </div>
          <label>目标站点</label>
          <select multiple value={form.targetSites} onChange={(e) => setForm({ ...form, targetSites: Array.from(e.target.selectedOptions).map((x) => x.value) })}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label className="inline-check"><input type="checkbox" checked={form.autoPublish} onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })} />自动发布</label>
          <button type="submit">创建任务</button>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Task</th><th>Runtime</th><th>Daily</th><th>Last Jobs</th><th>Action</th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.taskName}</td>
                <td>{t.runTime} UTC</td>
                <td>{t.dailyCount}</td>
                <td>{t.publishJobs?.slice(0, 2).map((j: any) => j.message).join(" | ") || "-"}</td>
                <td>
                  <div className="actions-inline">
                    <button onClick={async()=>{await fetch('/api/ai-tasks',{method:'PATCH',body:JSON.stringify({id:t.id,action:'run-now'})});await load();}}>立即执行</button>
                    <button className="btn-muted" onClick={async()=>{await fetch('/api/ai-tasks',{method:'PATCH',body:JSON.stringify({id:t.id,enabled:!t.enabled})});await load();}}>{t.enabled ? "停用" : "启用"}</button>
                    <button className="btn-danger" onClick={async()=>{await fetch(`/api/ai-tasks?id=${t.id}`,{method:'DELETE'});await load();}}>删除</button>
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
