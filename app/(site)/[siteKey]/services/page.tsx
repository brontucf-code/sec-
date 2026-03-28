import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { ConversionCta } from "@/components/site/conversion-cta";
import { SERVICE_PAGES } from "@/lib/service-pages";
import { getSiteByKey } from "@/lib/site-frontend";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string }> }): Promise<Metadata> {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};

  return {
    title: `SEC 合规办理服务 | ${site.name}`,
    description: "覆盖 SEC 办理、Form D 提交、EDGAR 开户与 RIA/ERA 注册的一站式合规服务页面。",
    alternates: { canonical: `https://${site.domain}/services` }
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const contactEmail = `consult@${site.domain}`;

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section className="service-listing">
        <h2>核心 SEC 办理服务</h2>
        <p>围绕「可落地 + 可转化」构建，下面四个服务页可直接承接文章流量并进入咨询。</p>
        <div className="service-grid">
          {SERVICE_PAGES.map((service) => (
            <article key={service.slug} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.seoDescription}</p>
              <Link href={`/${siteKey}/services/${service.slug}`}>查看服务详情 →</Link>
            </article>
          ))}
        </div>
      </section>

      <ConversionCta
        siteKey={siteKey}
        title="想先确认办理路径？"
        description="提交业务背景后，我们将给出 SEC/EDGAR/Form D/RIA 的优先级建议与落地计划。"
        contactEmail={contactEmail}
      />
    </SiteShell>
  );
}
