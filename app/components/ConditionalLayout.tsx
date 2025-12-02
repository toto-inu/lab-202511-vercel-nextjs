"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

/**
 * 条件付きレイアウトコンポーネント
 *
 * パスに応じて、ナビゲーションバーの表示/非表示を切り替えます。
 * 管理画面(/admin)の場合は、ナビゲーションバーを表示しません。
 */
export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDevLoginPath = pathname === "/dev-login";

  if (isAdminPath || isDevLoginPath) {
    // 管理画面・ログイン画面: ナビゲーションバーなし、スタイリングなし
    return <>{children}</>;
  }

  // 通常ページ: ナビゲーションバーあり、グラデーション背景
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {children}
      </main>
    </>
  );
}
