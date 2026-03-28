import { AdminLayout } from "@/components/admin-layout";

export default function Page() {
  return (
    <AdminLayout>
      <div className="card">
        <h1>系统设置</h1>
        <p>用于配置全局参数与运营规则（当前为基础版本，后续可扩展完整设置项）。</p>
      </div>
    </AdminLayout>
  );
}
