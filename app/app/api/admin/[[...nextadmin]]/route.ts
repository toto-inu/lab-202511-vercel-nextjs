import { prisma } from "@/lib/prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
  onRequest: async (req) => {
    // Clerk認証チェック
    const { userId, sessionClaims } = await auth();

    // ユーザーが認証されていない場合
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーのロールがADMINでない場合
    const userRole = (sessionClaims?.metadata as { role?: string })?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  },
});

export { run as DELETE, run as GET, run as POST };
