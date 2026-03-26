import Link from "next/link";

const menu = [
  ["Dashboard", "/"],
  ["Sites", "/sites"],
  ["Posts", "/posts"],
  ["Categories", "/categories"],
  ["Tags", "/tags"],
  ["Regulators", "/regulators"],
  ["Writing", "/writing"],
  ["Auto Publish", "/auto-publish"],
  ["SEO", "/seo"],
  ["Settings", "/settings"]
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>SEC Content CMS</h2>
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
