import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const site = await prisma.site.upsert({
    where: { siteKey: "default-sec" },
    update: {},
    create: {
      name: "Default SEC Site",
      siteKey: "default-sec",
      domain: "sec.example.com",
      themeColor: "#1E3A8A",
      seoTitle: "SEC Guide Hub",
      seoDescription: "SEC / EDGAR / Reg D professional content"
    }
  });

  const category = await prisma.category.upsert({
    where: { slug: "sec-basics" },
    update: {},
    create: { name: "SEC Basics", slug: "sec-basics" }
  });

  const regulator = await prisma.regulator.upsert({
    where: { code: "SEC" },
    update: {},
    create: { name: "U.S. Securities and Exchange Commission", code: "SEC" }
  });

  const post = await prisma.post.upsert({
    where: { slug: "what-is-form-d" },
    update: {},
    create: {
      title: "What is SEC Form D?",
      slug: "what-is-form-d",
      excerpt: "A practical primer for Regulation D offerings.",
      content: "# What is Form D\\n\\nForm D is a filing...",
      language: "en",
      status: "published",
      publishedAt: new Date(),
      categoryId: category.id,
      regulatorId: regulator.id
    }
  });

  await prisma.postSite.upsert({
    where: { postId_siteId: { postId: post.id, siteId: site.id } },
    update: {},
    create: { postId: post.id, siteId: site.id }
  });
}

main().finally(async () => prisma.$disconnect());
