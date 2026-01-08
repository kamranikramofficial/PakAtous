import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Prevent static path generation for this dynamic route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
