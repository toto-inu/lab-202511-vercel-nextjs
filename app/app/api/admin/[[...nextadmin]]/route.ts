import { prisma } from "@/lib/prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import { NextRequest, NextResponse } from "next/server";
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

// Next.js 15の型に合わせたラッパー関数
async function handler(
  req: NextRequest,
  context: { params: Promise<{ nextadmin?: string[] }> }
) {
  const resolvedParams = await context.params;
  return run(req as any, {
    params: Promise.resolve({ nextadmin: resolvedParams.nextadmin || [] })
  } as any);
}

export { handler as DELETE, handler as GET, handler as POST };
