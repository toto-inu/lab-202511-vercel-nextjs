import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App",
  description: "シンプルなTodoアプリケーション",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDevLoginPath = pathname === "/dev-login";
  const showNavigation = !isAdminPath && !isDevLoginPath;

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {showNavigation && <Navigation />}
        {showNavigation ? (
          <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {children}
          </main>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
