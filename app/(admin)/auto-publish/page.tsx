"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Task = {
  id: string;
  taskName: string;
  enabled: boolean;
  runTime: string;
  dailyCount: number;
  targetSitesJson: string[];
  language: string;
  articleType: string;
  autoPublish: boolean;
  publishJobs?: { id: string; message: string; status: string; createdAt: string }[];
};

type Keyword = {
  id: string;
  keyword: string;
  type: string;
  language: string;
  priority: number;
  isUsed: boolean;
};

const emptyTaskForm = {
  id: "",
  taskName: "Daily SEC Auto Publish",
  enabled: true,
  runTime: "09:00",
  targetSites: [] as string[],
  language: "en",
  dailyCount: 1,
  articleType: "tutorial",
  autoPublish: true
};

const emptyKeywordForm = { id: "", keyword: "", type: "question", language: "en", priority: 3, isUsed: false };

export default function AutoPublishPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [keywordForm, setKeywordForm] = useState(emptyKeywordForm);

  const loadTasks = async () => setTasks(await (await fetch("/api/ai-tasks")).json());
  const loadKeywords = async () => setKeywords(await (await fetch("/api/keywords")).json());

  useEffect(() => {
    void loadTasks();
    void loadKeywords();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const taskEditing = useMemo(() => Boolean(taskForm.id), [taskForm.id]);
  const keywordEditing = useMemo(() => Boolean(keywordForm.id), [keywordForm.id]);

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...taskForm,
      dailyCount: Number(taskForm.dailyCount),
      targetSites: taskForm.targetSites
    };

    await fetch("/api/ai-tasks", {
      method: taskEditing ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });

    setTaskForm(emptyTaskForm);
    await loadTasks();
  };

  const saveKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...keywordForm, priority: Number(keywordForm.priority) };
    await fetch("/api/keywords", {
      method: keywordEditing ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });
    setKeywordForm(emptyKeywordForm);
    await loadKeywords();
  };

  return (
    <AdminLayout>
      <div className="grid2">
        <div className="card">
          <h1>Auto Publish 任务</h1>
          <p className="hint">闭环：Auto Publish → AI Generate → Posts → Sites → Publish（runTime 使用 UTC）。</p>
          <form onSubmit={saveTask}>
            <input
              placeholder="taskName"
              value={taskForm.taskName}
              onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
              required
            />
            <div className="grid2">
              <input value={taskForm.runTime} onChange={(e) => setTaskForm({ ...taskForm, runTime: e.target.value })} required />
              <input
                type="number"
                value={taskForm.dailyCount}
                min={1}
                onChange={(e) => setTaskForm({ ...taskForm, dailyCount: Number(e.target.value) })}
              />
            </div>
            <div className="grid2">
              <input value={taskForm.language} onChange={(e) => setTaskForm({ ...taskForm, language: e.target.value })} />
              <select value={taskForm.articleType} onChange={(e) => setTaskForm({ ...taskForm, articleType: e.target.value })}>
                <option value="question">question</option>
                <option value="tutorial">tutorial</option>
                <option value="compare">compare</option>
                <option value="longtail">longtail</option>
              </select>
            </div>
            <label>targetSites（多选）</label>
            <select
              multiple
              value={taskForm.targetSites}
              onChange={(e) => setTaskForm({ ...taskForm, targetSites: Array.from(e.target.selectedOptions).map((x) => x.value) })}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label className="inline-check">
              <input type="checkbox" checked={taskForm.enabled} onChange={(e) => setTaskForm({ ...taskForm, enabled: e.target.checked })} />
              enabled
            </label>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={taskForm.autoPublish}
                onChange={(e) => setTaskForm({ ...taskForm, autoPublish: e.target.checked })}
              />
              autoPublish
            </label>
            <div className="actions-inline">
              <button type="submit">{taskEditing ? "更新任务" : "创建任务"}</button>
              {taskEditing && (
                <button type="button" className="btn-muted" onClick={() => setTaskForm(emptyTaskForm)}>
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>关键词池</h2>
          <form onSubmit={saveKeyword}>
            <input
              placeholder="keyword"
              value={keywordForm.keyword}
              onChange={(e) => setKeywordForm({ ...keywordForm, keyword: e.target.value })}
              required
            />
            <div className="grid2">
              <input value={keywordForm.type} onChange={(e) => setKeywordForm({ ...keywordForm, type: e.target.value })} placeholder="type" />
              <input
                value={keywordForm.language}
                onChange={(e) => setKeywordForm({ ...keywordForm, language: e.target.value })}
                placeholder="language"
              />
            </div>
            <div className="grid2">
              <input
                type="number"
                min={1}
                max={10}
                value={keywordForm.priority}
                onChange={(e) => setKeywordForm({ ...keywordForm, priority: Number(e.target.value) })}
              />
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={keywordForm.isUsed}
                  onChange={(e) => setKeywordForm({ ...keywordForm, isUsed: e.target.checked })}
                />
                isUsed
              </label>
            </div>
            <div className="actions-inline">
              <button type="submit">{keywordEditing ? "更新关键词" : "新增关键词"}</button>
              {keywordEditing && (
                <button type="button" className="btn-muted" onClick={() => setKeywordForm(emptyKeywordForm)}>
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>任务列表</h2>
        <table>
          <thead>
            <tr>
              <th>taskName</th>
              <th>enabled</th>
              <th>runTime</th>
              <th>dailyCount</th>
              <th>language</th>
              <th>articleType</th>
              <th>autoPublish</th>
              <th>targetSites</th>
              <th>最近执行</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.taskName}</td>
                <td>{String(t.enabled)}</td>
                <td>{t.runTime} UTC</td>
                <td>{t.dailyCount}</td>
                <td>{t.language}</td>
                <td>{t.articleType}</td>
                <td>{String(t.autoPublish)}</td>
                <td>
                  {t.targetSitesJson?.length
                    ? t.targetSitesJson.map((siteId) => sites.find((s) => s.id === siteId)?.name || siteId).join(", ")
                    : "-"}
                </td>
                <td>{t.publishJobs?.[0]?.message || "-"}</td>
                <td>
                  <div className="actions-inline">
                    <button
                      onClick={() =>
                        setTaskForm({
                          id: t.id,
                          taskName: t.taskName,
                          enabled: t.enabled,
                          runTime: t.runTime,
                          dailyCount: t.dailyCount,
                          targetSites: t.targetSitesJson || [],
                          language: t.language,
                          articleType: t.articleType,
                          autoPublish: t.autoPublish
                        })
                      }
                    >
                      编辑
                    </button>
                    <button
                      className="btn-muted"
                      onClick={async () => {
                        await fetch("/api/ai-tasks", { method: "PATCH", body: JSON.stringify({ id: t.id, action: "run-now" }) });
                        await Promise.all([loadTasks(), loadKeywords()]);
                      }}
                    >
                      立即执行
                    </button>
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        await fetch(`/api/ai-tasks?id=${t.id}`, { method: "DELETE" });
                        await loadTasks();
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

      <div className="card">
        <h2>关键词池列表</h2>
        <table>
          <thead>
            <tr>
              <th>keyword</th>
              <th>type</th>
              <th>language</th>
              <th>priority</th>
              <th>isUsed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((k) => (
              <tr key={k.id}>
                <td>{k.keyword}</td>
                <td>{k.type}</td>
                <td>{k.language}</td>
                <td>{k.priority}</td>
                <td>{String(k.isUsed)}</td>
                <td>
                  <div className="actions-inline">
                    <button onClick={() => setKeywordForm(k)}>编辑</button>
                    <button
                      className="btn-muted"
                      onClick={async () => {
                        await fetch("/api/keywords", { method: "PATCH", body: JSON.stringify({ id: k.id, isUsed: !k.isUsed }) });
                        await loadKeywords();
                      }}
                    >
                      标记{k.isUsed ? "未使用" : "已使用"}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        await fetch(`/api/keywords?id=${k.id}`, { method: "DELETE" });
                        await loadKeywords();
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
