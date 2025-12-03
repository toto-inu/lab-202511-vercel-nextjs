import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理画面 - Todo App",
  description: "Next-Admin 管理画面",
};

/**
 * 管理画面専用レイアウト
 *
 * Next-Adminの独自UIのみを表示します。
 * スタイルはglobals.cssで統合管理されています。
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">{children}</div>;
}
