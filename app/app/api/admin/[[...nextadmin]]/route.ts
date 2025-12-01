import { prisma } from "@/lib/prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import { NextResponse } from "next/server";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
  onRequest: async (req) => {
    // Basic authentication check - Replace with proper auth in production
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn("ADMIN_PASSWORD environment variable is not set. Admin API access is blocked.");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // In a real implementation, you would check user session here
    // For example with Clerk:
    // const { userId, sessionClaims } = await auth();
    // if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
  },
});

export { run as DELETE, run as GET, run as POST };
