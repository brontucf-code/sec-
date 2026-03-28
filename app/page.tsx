import { AdminLayout } from "@/components/admin-layout";
import { prisma } from "@/lib/prisma";

function dayRange(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

export default async function DashboardPage() {
  const { start, end } = dayRange();
  const [todayGenerated, todayPublished, recentJobs, recentFailures] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.post.count({ where: { status: "published", publishedAt: { gte: start, lte: end } } }),
    prisma.publishJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { task: { select: { taskName: true } }, post: { select: { title: true, status: true } } }
    }),
    prisma.publishJob.findMany({
      where: { status: "failed" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { task: { select: { taskName: true } } }
    })
  ]);

  return (
    <AdminLayout>
      <div className="grid2">
        <div className="card">
          <h1>Dashboard</h1>
          <p>今日生成数量：{todayGenerated}</p>
          <p>今日发布数量：{todayPublished}</p>
        </div>
        <div className="card">
          <h2>最近失败记录</h2>
          {!recentFailures.length && <p className="hint">暂无失败任务</p>}
          <ul>
            {recentFailures.map((job) => (
              <li key={job.id}>
                [{new Date(job.createdAt).toLocaleString("zh-CN", { hour12: false })}] {job.task?.taskName || "Unknown task"}: {job.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h2>最近任务执行记录</h2>
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>任务</th>
              <th>Post</th>
              <th>状态</th>
              <th>消息</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((job) => (
              <tr key={job.id}>
                <td>{new Date(job.createdAt).toLocaleString("zh-CN", { hour12: false })}</td>
                <td>{job.task?.taskName || "-"}</td>
                <td>{job.post?.title || "-"}</td>
                <td>{job.status}</td>
                <td>{job.message || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
