import { NextAdmin } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/dist/appRouter";
import { prisma } from "@/lib/prisma";
import schema from "@/prisma/json-schema/json-schema.json";
import "@/app/globals.css";

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
