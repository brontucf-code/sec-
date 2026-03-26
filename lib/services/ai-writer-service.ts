import { ArticleType } from "@prisma/client";

type WriterInput = {
  primaryKeyword: string;
  secondaryKeywords: string[];
  language: string;
  articleType: ArticleType;
  audience: string;
  tone: string;
  wordRange: string;
  generateTitle: boolean;
  generateMeta: boolean;
  generateFaq: boolean;
  generateOutline: boolean;
  generateBody: boolean;
};

export const aiWriterService = {
  async generate(input: WriterInput) {
    const title = `${input.primaryKeyword}: ${input.articleType} guide`;
    const outline = [
      "Introduction",
      `${input.primaryKeyword} compliance basics`,
      "Required filings and timelines",
      "Common mistakes and best practices",
      "Conclusion"
    ];

    return {
      title: input.generateTitle ? title : "",
      seoTitle: input.generateMeta ? `${title} | SEC Content Hub` : "",
      seoDescription: input.generateMeta
        ? `Learn ${input.primaryKeyword} for ${input.audience} with a ${input.tone} style.`
        : "",
      faq: input.generateFaq
        ? [
            { question: `What is ${input.primaryKeyword}?`, answer: `${input.primaryKeyword} is a key SEC topic.` },
            { question: "Who should care?", answer: input.audience }
          ]
        : [],
      outline: input.generateOutline ? outline : [],
      content: input.generateBody
        ? `# ${title}\n\nThis ${input.language} article targets ${input.audience}.\n\n## Key points\n${input.secondaryKeywords
            .map((k) => `- ${k}`)
            .join("\n")}`
        : ""
    };
  }
};
