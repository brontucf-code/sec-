import Link from "next/link";

const menu = [
  ["运营概览", "/"],
  ["站点管理", "/sites"],
  ["文章管理", "/posts"],
  ["分类管理", "/categories"],
  ["标签管理", "/tags"],
  ["监管机构", "/regulators"],
  ["AI内容生成", "/writing"],
  ["自动发布任务", "/auto-publish"],
  ["SEO优化中心", "/seo"],
  ["系统设置", "/settings"]
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>SEC 内容运营后台</h2>
      <ul>
        {menu.map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
