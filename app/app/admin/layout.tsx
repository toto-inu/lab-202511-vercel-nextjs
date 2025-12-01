import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理画面 - Todo App",
  description: "Next-Admin 管理画面",
};

/**
 * 管理画面専用レイアウト
 *
 * 既存のアプリケーションのナビゲーションバーを非表示にし、
 * Next-Adminの独自UIのみを表示します。
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">{children}</div>;
}
