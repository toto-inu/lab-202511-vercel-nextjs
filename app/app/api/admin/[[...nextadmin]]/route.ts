import { prisma } from "@/lib/prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import { options } from "@/lib/next-admin-options";
import { NextResponse } from "next/server";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
  options,
  onRequest: async (req) => {
    // 基本的な認証チェック - 本番環境では適切な認証に置き換えてください
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn("ADMIN_PASSWORD環境変数が設定されていません。管理API へのアクセスをブロックしました。");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 実際の実装では、ここでユーザーセッションをチェックします
    // Clerkを使用する場合の例:
    // const { userId, sessionClaims } = await auth();
    // if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
  },
});

export { run as DELETE, run as GET, run as POST, run as PUT };
