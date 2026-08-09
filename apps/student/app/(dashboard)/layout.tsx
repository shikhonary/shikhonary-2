import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@workspace/auth/server"
import { db } from "@workspace/db/main"
import { AdminShell } from "@/components/layout"

/**
 * Dashboard layout — Server Component auth gate.
 *
 * Checks authorization server-side before rendering the page:
 *   1. Resolve Better Auth session.
 *   2. Redirect unauthenticated users to /auth/sign-in.
 *   3. Fetch roles and student onboarding profile.
 *   4. Check user has role USER / STUDENT / Student or SUPER_ADMIN.
 *   5. If they have not completed onboarding, redirect to /onboarding.
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

  // Fetch roles and student profile in a single query alongside user
  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      roles: { select: { name: true } },
      student: { select: { id: true } },
    },
  })

  const roles = userWithRoles?.roles || []
  const isSuperAdmin = roles.some((r) => r.name === "SUPER_ADMIN")
  const isUserRole =
    roles.some(
      (r) =>
        r.name === "USER" ||
        r.name === "STUDENT" ||
        r.name === "Student"
    ) || (!isSuperAdmin && roles.length > 0)

  if (!isSuperAdmin && !isUserRole) {
    // Redirect unauthorized users (e.g. admins visiting student app)
    redirect("/auth/sign-in?error=unauthorized")
  }

  // Redirect to onboarding if profile is not completed (except for super admin)
  if (!isSuperAdmin && !userWithRoles?.student) {
    redirect("/onboarding")
  }

  return <AdminShell>{children}</AdminShell>
}
