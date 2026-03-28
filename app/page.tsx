import { AdminLayout } from "@/components/admin-layout";

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="card">
        <h1>运营概览</h1>
        <p>SEC 内容运营系统控制台。可在左侧进入站点、文章、自动发布与 SEO 模块。</p>
      </div>
    </AdminLayout>
  );
}
