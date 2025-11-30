import { NextAdmin } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { prisma } from "@/lib/prisma";
import schema from "@/prisma/json-schema/json-schema.json";
import "@/app/globals.css";

/**
 * Next-Admin Dashboard Page
 *
 * WARNING: This admin interface is currently NOT protected by authentication.
 * In production, you should add authentication middleware to protect this route.
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
