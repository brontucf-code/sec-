import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConversionCta } from "@/components/site/conversion-cta";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteByKey } from "@/lib/site-frontend";
import { SERVICE_PAGE_MAP, type ServicePage } from "@/lib/service-pages";

function getService(slug: string): ServicePage | null {
  return SERVICE_PAGE_MAP[slug as ServicePage["slug"]] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  const service = getService(slug);
  if (!site || !service) return {};

  return {
    title: `${service.title} | ${site.name}`,
    description: service.seoDescription,
    alternates: { canonical: `https://${site.domain}/services/${service.slug}` }
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const service = getService(slug);
  if (!service) return notFound();

  const contactEmail = `consult@${site.domain}`;

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <article className="service-detail">
        <h2>{service.title}</h2>
        <p className="service-intro">{service.intro}</p>

        <section>
          <h3>我们提供的关键交付</h3>
          <ul>
            {service.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>适合哪些团队</h3>
          <p>
            计划在美国市场融资、提交监管文件或搭建投顾合规体系的团队，都可以通过该服务页快速进入咨询并获取执行方案。
          </p>
        </section>
      </article>

      <ConversionCta
        siteKey={siteKey}
        title={service.ctaTitle}
        description={service.ctaText}
        contactEmail={contactEmail}
        primaryHref={`/${siteKey}/services`}
        primaryLabel="查看全部服务"
      />
    </SiteShell>
  );
}
