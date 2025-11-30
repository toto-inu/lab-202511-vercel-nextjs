import { prisma } from "@/lib/prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
});

export { run as DELETE, run as GET, run as POST };
