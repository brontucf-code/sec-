import Link from "next/link";
import { SEO_CHANNELS } from "@/lib/site-frontend";

type SiteShellProps = {
  siteKey: string;
  siteName: string;
  children: React.ReactNode;
};

export function SiteShell({ siteKey, siteName, children }: SiteShellProps) {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div>
          <p className="site-label">SEO Content Hub</p>
          <h1>{siteName}</h1>
        </div>
        <nav className="site-nav">
          <Link href={`/${siteKey}`}>首页</Link>
          <Link href={`/${siteKey}/posts`}>最新文章</Link>
          <Link href={`/${siteKey}/categories`}>分类</Link>
          <Link href={`/${siteKey}/tags`}>标签</Link>
          <Link href={`/${siteKey}/regulators`}>监管机构</Link>
        </nav>
      </header>

      <section className="channel-entry">
        <h2>重点栏目</h2>
        <div className="channel-grid">
          {SEO_CHANNELS.map((channel) => (
            <Link key={channel.key} href={`/${siteKey}${channel.href}`} className="channel-card">
              {channel.label}
            </Link>
          ))}
        </div>
      </section>

      {children}
    </main>
  );
}
