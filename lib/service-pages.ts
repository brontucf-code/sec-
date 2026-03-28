export type ServicePage = {
  slug: "sec-filing" | "form-d-filing" | "edgar-account" | "ria-era-registration";
  title: string;
  shortTitle: string;
  seoDescription: string;
  intro: string;
  highlights: string[];
  ctaTitle: string;
  ctaText: string;
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "sec-filing",
    title: "SEC 办理服务",
    shortTitle: "SEC办理",
    seoDescription: "为基金、顾问与发行主体提供 SEC 申报路径评估、材料准备与全流程办理服务。",
    intro:
      "面向首次进入美国资本市场的团队，我们提供 SEC 申报路径梳理、披露文件核对、时间线管理与提交支持，确保项目在合规前提下尽快上线。",
    highlights: [
      "按业务模式评估 SEC 监管适配路径",
      "材料清单、披露文本与时间节点统一管理",
      "提交前合规审阅，降低被退回与补件概率"
    ],
    ctaTitle: "准备启动 SEC 办理？",
    ctaText: "提交公司背景后，我们会在 1 个工作日内给出办理路径与预计周期。"
  },
  {
    slug: "form-d-filing",
    title: "Form D 提交服务",
    shortTitle: "Form D提交",
    seoDescription: "提供 Reg D / Form D 申报、州级 Blue Sky 通知与后续信息更新支持。",
    intro:
      "针对 Reg D 募资项目，我们协助完成 Form D 表单准备、提交窗口管理、州级配套通知和后续修订，帮助团队顺利启动募资。",
    highlights: [
      "募集结构审阅与 Form D 字段核对",
      "电子提交与回执留档",
      "Blue Sky 通知与后续 amendment 跟进"
    ],
    ctaTitle: "需要快速完成 Form D？",
    ctaText: "我们可按发行日倒排计划，优先完成关键字段与提交环节。"
  },
  {
    slug: "edgar-account",
    title: "EDGAR 开户服务",
    shortTitle: "EDGAR开户",
    seoDescription: "提供 EDGAR 账户申请、CIK/CCC 获取与申报权限配置，支持后续文件提交。",
    intro:
      "EDGAR 账户是多数 SEC 电子申报的基础能力。我们提供从账户注册、凭证管理到提交前测试的完整支持，减少开户错误导致的延误。",
    highlights: [
      "CIK/CCC 申请与验证流程支持",
      "账户安全策略与权限分配建议",
      "首次提交前测试与常见报错排查"
    ],
    ctaTitle: "先把 EDGAR 基建搭好",
    ctaText: "预约 20 分钟评估，明确贵司 EDGAR 开户所需材料与预计完成时间。"
  },
  {
    slug: "ria-era-registration",
    title: "RIA / ERA 注册服务",
    shortTitle: "RIA/ERA注册",
    seoDescription: "协助投资顾问机构完成 RIA/ERA 注册判断、ADV 披露、监管对接与持续合规配置。",
    intro:
      "如果你正在评估投顾牌照路径，我们将从注册义务判断、ADV 披露文本到后续合规计划进行一体化设计，帮助业务平稳落地。",
    highlights: [
      "RIA/ERA 身份判断与监管辖区分析",
      "Form ADV 关键信息梳理与披露支持",
      "注册后年度更新与持续合规建议"
    ],
    ctaTitle: "确认你适用 RIA 还是 ERA",
    ctaText: "提交业务模型后，我们将给出注册路径建议与预计工作量。"
  }
];

export const SERVICE_PAGE_MAP = Object.fromEntries(SERVICE_PAGES.map((item) => [item.slug, item])) as Record<
  ServicePage["slug"],
  ServicePage
>;
