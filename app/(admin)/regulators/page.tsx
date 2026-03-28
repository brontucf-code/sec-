import { AdminLayout } from "@/components/admin-layout";

export default function Page() {
  return (
    <AdminLayout>
      <div className="card">
        <h1>监管机构</h1>
        <p>用于维护监管机构及代码映射，便于文章关联（当前为基础版本，后续可扩展 CRUD）。</p>
      </div>
    </AdminLayout>
  );
}
