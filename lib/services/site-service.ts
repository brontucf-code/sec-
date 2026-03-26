import { prisma } from "@/lib/prisma";

export const siteService = {
  list: () => prisma.site.findMany({ orderBy: { createdAt: "desc" } }),
  create: (data: Parameters<typeof prisma.site.create>[0]["data"]) => prisma.site.create({ data }),
  update: (id: string, data: Parameters<typeof prisma.site.update>[0]["data"]) =>
    prisma.site.update({ where: { id }, data }),
  remove: (id: string) => prisma.site.delete({ where: { id } })
};
