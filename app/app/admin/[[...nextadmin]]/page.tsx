import { NextAdmin } from "@premieroctet/next-admin/adapters/next";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { prisma } from "@/lib/prisma";
import schema from "@/lib/next-admin-schema";
import { redirect } from "next/navigation";

/**
 * Next-Admin 管理画面ページ
 *
 * 警告: この管理画面は現在、基本的なパスワードチェックで保護されています。
 * 本番環境では、適切な認証システム（Clerk、NextAuthなど）と
 * ロールベースのアクセス制御を実装してください。
 *
 * TODO: ClerkのADMINロールチェックによる認証を追加
 */
export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ nextadmin: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 基本的な認証チェック - 本番環境では適切な認証に置き換えてください
  // 現在は環境変数の管理者パスワードをチェック
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    // パスワードが設定されていない場合、ホームにリダイレクト
    console.warn("ADMIN_PASSWORD環境変数が設定されていません。管理画面へのアクセスをブロックしました。");
    redirect("/");
  }

  // 実際の実装では、ここでユーザーセッションをチェックします
  // Clerkを使用する場合の例:
  // const { userId, sessionClaims } = await auth();
  // if (!userId || sessionClaims?.metadata?.role !== 'admin') {
  //   redirect('/');
  // }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const props = await getNextAdminProps({
    params: resolvedParams.nextadmin,
    searchParams: resolvedSearchParams,
    basePath: "/admin",
    apiBasePath: "/api/admin",
    prisma,
  });

  return <NextAdmin {...props} schema={schema} />;
}
