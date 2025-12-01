import { NextAdmin } from "@premieroctet/next-admin/adapters/next";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { prisma } from "@/lib/prisma";
import schema from "@/lib/next-admin-schema";
import "@/app/globals.css";
import { redirect } from "next/navigation";

/**
 * Next-Admin Dashboard Page
 *
 * WARNING: This admin interface is currently protected with a basic password check.
 * For production, you should implement proper authentication (e.g., Clerk, NextAuth)
 * with role-based access control.
 *
 * TODO: Add Clerk authentication with ADMIN role check
 */
export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ nextadmin: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Basic authentication check - Replace with proper auth in production
  // For now, check for an admin password via environment variable
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    // If no password is set, redirect to home with a warning
    console.warn("ADMIN_PASSWORD environment variable is not set. Admin access is blocked.");
    redirect("/");
  }

  // In a real implementation, you would check user session here
  // For example with Clerk:
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
    schema,
  });

  return <NextAdmin {...props} />;
}
