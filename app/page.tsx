import { AdminLayout } from "@/components/admin-layout";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    siteCount,
    taskCount,
    recentPosts,
    recentPublishLogs
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.site.count(),
    prisma.aiTask.count(),
    prisma.post.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true, createdAt: true } }),
    prisma.publishJob.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true } }, task: { select: { taskName: true } } }
    })
  ]);

  return (
    <AdminLayout>
      <div className="grid2">
        <div className="card">
          <h3>总文章数</h3>
          <h1>{totalPosts}</h1>
        </div>
        <div className="card">
          <h3>已发布文章数</h3>
          <h1>{publishedPosts}</h1>
        </div>
        <div className="card">
          <h3>草稿数</h3>
          <h1>{draftPosts}</h1>
        </div>
        <div className="card">
          <h3>站点数量</h3>
          <h1>{siteCount}</h1>
        </div>
        <div className="card">
          <h3>自动任务数量</h3>
          <h1>{taskCount}</h1>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>最近文章</h2>
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.status}</td>
                  <td>{post.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>最近发布记录</h2>
          <table>
            <thead>
              <tr>
                <th>任务</th>
                <th>文章</th>
                <th>状态</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {recentPublishLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.task?.taskName ?? "手动发布"}</td>
                  <td>{log.post?.title ?? "-"}</td>
                  <td>{log.status}</td>
                  <td>{log.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
