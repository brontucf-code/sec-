const INTERNAL_LINK_RULES = [
  { keyword: "SEC 办理", href: "/{siteKey}/services/sec-filing" },
  { keyword: "Form D", href: "/{siteKey}/services/form-d-filing" },
  { keyword: "EDGAR", href: "/{siteKey}/services/edgar-account" },
  { keyword: "RIA", href: "/{siteKey}/services/ria-era-registration" },
  { keyword: "ERA", href: "/{siteKey}/services/ria-era-registration" },
  { keyword: "Reg D", href: "/{siteKey}/topics/form-d" },
  { keyword: "investment adviser", href: "/{siteKey}/topics/ria-era" }
] as const;

export type InternalLinkRule = {
  keyword: string;
  href: string;
};

export function getInternalLinkRules(siteKey: string): InternalLinkRule[] {
  return INTERNAL_LINK_RULES.map((rule) => ({
    keyword: rule.keyword,
    href: rule.href.replace("{siteKey}", siteKey)
  }));
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function autoLinkHtml(text: string, siteKey: string) {
  let html = escapeHtml(text);

  for (const rule of getInternalLinkRules(siteKey)) {
    const pattern = new RegExp(`(^|[\\s(（])(${escapeRegExp(rule.keyword)})(?=[\\s),.，。；;）]|$)`, "i");
    if (pattern.test(html)) {
      html = html.replace(
        pattern,
        `$1<a class=\"inline-link\" href=\"${rule.href}\">$2</a>`
      );
    }
  }

  return html;
}
