import { prisma } from "@/lib/prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
  onRequest: async (req) => {
    // Better Auth認証チェック
    const user = await getCurrentUser();

    // ユーザーが認証されていない場合
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // グローバル管理者でない場合
    if (!user.isGlobalAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  },
});

export { run as DELETE, run as GET, run as POST };
