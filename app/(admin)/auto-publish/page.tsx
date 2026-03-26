"use client";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";

export default function AutoPublishPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [form, setForm] = useState({ taskName: "Daily SEC", enabled: true, runTime: "09:00", targetSites: [], language: "en", dailyCount: 1, keywordSource: "Form D", articleType: "tutorial", autoPublish: false });
  const load = async () => setTasks(await (await fetch("/api/ai-tasks")).json());
  useEffect(() => { void load(); }, []);

  return <AdminLayout><div className="card"><h1>Auto Publish</h1>
    <form onSubmit={async(e)=>{e.preventDefault();await fetch('/api/ai-tasks',{method:'POST',body:JSON.stringify(form)});await load();}}>
      <input value={form.taskName} onChange={(e)=>setForm({...form,taskName:e.target.value})} />
      <input value={form.runTime} onChange={(e)=>setForm({...form,runTime:e.target.value})} />
      <input value={form.keywordSource} onChange={(e)=>setForm({...form,keywordSource:e.target.value})} />
      <button type="submit">Save Task</button>
    </form></div>
    <div className="card"><pre>{JSON.stringify(tasks,null,2)}</pre></div></AdminLayout>;
}
