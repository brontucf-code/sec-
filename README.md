# SEC 办理推广内容系统（MVP）

一个以 SEO 为核心的多站点内容后台（Next.js + Prisma + SQLite）。

## 功能覆盖
- 多站点管理（Site）
- 文章管理（Post + 多站点绑定）
- AI 写作页 `/writing`（mock 生成，已抽离 service）
- 自动发布任务 `/auto-publish`（mock scheduler）
- SEO 基础：meta、slug、sitemap、按站点筛选接口、相关推荐、FAQ JSON-LD 预留

## 快速启动
```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## 关键入口
- 管理后台：`/`
- Sites：`/sites`
- Posts：`/posts`
- Writing：`/writing`
- Auto Publish：`/auto-publish`
- SEO：`/seo`
- 站点文章列表：`/[siteKey]/posts`
- 站点文章详情：`/[siteKey]/posts/[slug]`
- sitemap：`/api/seo/sitemap.xml`
- 站点文章 API：`/api/public/sites/[siteKey]/posts`

## 接入真实 OpenAI API
修改 `lib/services/ai-writer-service.ts`：
1. 把 `generate` 中 mock 逻辑替换成真实 OpenAI SDK 调用
2. 保持返回结构不变，页面和 scheduler 可无缝复用
3. 可在 `.env` 增加 `OPENAI_API_KEY` 等变量
