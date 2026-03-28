import { AdminLayout } from "@/components/admin-layout";

export default function Page() {
  return (
    <AdminLayout>
      <div className="card">
        <h1>标签管理</h1>
        <p>用于维护标签库并支持内容聚合（当前为基础版本，后续可扩展完整 CRUD）。</p>
      </div>
    </AdminLayout>
  );
}
