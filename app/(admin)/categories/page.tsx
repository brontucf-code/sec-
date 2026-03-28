import { AdminLayout } from "@/components/admin-layout";

export default function Page() {
  return (
    <AdminLayout>
      <div className="card">
        <h1>分类管理</h1>
        <p>用于维护文章分类体系（当前为基础版本，后续可扩展完整 CRUD）。</p>
      </div>
    </AdminLayout>
  );
}
