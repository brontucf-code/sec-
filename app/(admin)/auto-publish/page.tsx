"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

type Site = { id: string; name: string };
type Task = {
  id: string;
  taskName: string;
  enabled: boolean;
  runTime: string;
  dailyCount: number;
  language: string;
  articleType: string;
  autoPublish: boolean;
  keywordSource: string;
  targetSitesJson: string[];
};

const initialForm = {
  taskName: "Daily SEC",
  enabled: true,
  runTime: "09:00",
  dailyCount: 1,
  targetSites: [] as string[],
  language: "en",
  articleType: "tutorial",
  autoPublish: false,
  keywordSource: "Form D filing,Reg D exemption"
};

export default function AutoPublishPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => setTasks(await (await fetch("/api/ai-tasks")).json());

  useEffect(() => {
    void load();
    void (async () => setSites(await (await fetch("/api/sites")).json()))();
  }, []);

  const createTask = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/ai-tasks", { method: "POST", body: JSON.stringify(form) });
    setForm(initialForm);
    await load();
  };

  return (
    <AdminLayout>
      <div className="card">
        <h1>Auto Publish</h1>
        <form onSubmit={createTask}>
          <input value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} placeholder="taskName" />
          <label>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            enabled
          </label>
          <input value={form.runTime} onChange={(e) => setForm({ ...form, runTime: e.target.value })} placeholder="runTime" />
          <input
            type="number"
            min={1}
            value={form.dailyCount}
            onChange={(e) => setForm({ ...form, dailyCount: Number(e.target.value) })}
            placeholder="dailyCount"
          />
          <label>targetSites</label>
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
          <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="language" />
          <select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}>
            <option value="question">question</option>
            <option value="tutorial">tutorial</option>
            <option value="compare">compare</option>
            <option value="longtail">longtail</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={form.autoPublish}
              onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })}
            />
            autoPublish
          </label>
          <textarea
            value={form.keywordSource}
            onChange={(e) => setForm({ ...form, keywordSource: e.target.value })}
            placeholder="keywords, split by comma or newline"
          />
          <button type="submit">Create Task</button>
        </form>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>taskName</th>
              <th>runTime</th>
              <th>dailyCount</th>
              <th>language</th>
              <th>articleType</th>
              <th>autoPublish</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.taskName}</td>
                <td>{task.runTime}</td>
                <td>{task.dailyCount}</td>
                <td>{task.language}</td>
                <td>{task.articleType}</td>
                <td>{task.autoPublish ? "true" : "false"}</td>
                <td>
                  <button
                    onClick={async () => {
                      await fetch("/api/ai-tasks", {
                        method: "PUT",
                        body: JSON.stringify({ ...task, targetSites: task.targetSitesJson, enabled: !task.enabled })
                      });
                      await load();
                    }}
                  >
                    {task.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/ai-tasks/${task.id}/run`, { method: "POST" });
                      await load();
                    }}
                  >
                    Run Now
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/ai-tasks?id=${task.id}`, { method: "DELETE" });
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
