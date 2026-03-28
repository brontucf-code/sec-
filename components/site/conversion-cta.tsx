type ConversionCtaProps = {
  siteKey: string;
  title: string;
  description: string;
  contactEmail: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function ConversionCta({
  siteKey,
  title,
  description,
  contactEmail,
  primaryHref,
  primaryLabel = "预约合规咨询"
}: ConversionCtaProps) {
  return (
    <section className="conversion-cta" aria-label="转化咨询">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="conversion-actions">
        <a className="btn-primary-link" href={`mailto:${contactEmail}`}>
          发送需求到 {contactEmail}
        </a>
        <a className="btn-secondary-link" href={primaryHref || `/${siteKey}/services`}>
          {primaryLabel}
        </a>
      </div>
      <p className="contact-line">咨询微信/电话：+1 (646) 555-0199（工作日 9:00-18:00 ET）</p>
    </section>
  );
}
