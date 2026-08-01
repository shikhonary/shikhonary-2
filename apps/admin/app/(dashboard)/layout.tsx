import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@workspace/auth/server"
import { db } from "@workspace/db/main"
import { AdminShell } from "@/components/layout"

/**
 * Dashboard layout — Server Component auth gate.
 *
 * Runs on the server before any HTML is sent to the browser, so there is
 * no client-side spinner and no extra round-trips from the browser:
 *
 *   1. Resolve the Better Auth session from the request cookies.
 *   2. Redirect unauthenticated visitors to /auth/sign-in.
 *   3. Check the user has the SUPER_ADMIN role.
 *   4. Redirect unauthorized users (e.g. plain students) to /auth/sign-in?error=unauthorized.
 *   5. Render the AdminShell + page for authorized admins.
 *
 * The tRPC `adminProcedure` middleware still independently enforces role
 * checks on every API call (defense-in-depth), so this gate can be
 * thought of as the UX layer while adminProcedure is the security layer.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resolve session server-side — zero browser round-trips
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Fetch roles in a single query alongside the session user
  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roles: { select: { name: true } } },
  })

  const isSuperAdmin =
    userWithRoles?.roles?.some((r) => r.name === "SUPER_ADMIN") ?? false

  if (!isSuperAdmin) {
    // Redirect with an error hint so the sign-in page can show a message
    redirect("/auth/sign-in?error=unauthorized")
  }

  return <AdminShell>{children}</AdminShell>
}
