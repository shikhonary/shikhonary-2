import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@workspace/auth/server"
import { db } from "@workspace/db/main"
import { OnboardingForm } from "@/modules/onboarding/components/onboarding-form"

export const metadata = {
  title: "Student Onboarding | Onboarding",
  description: "Complete your student profile to access dashboard.",
}

export default async function OnboardingPage() {
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
    // Redirect unauthorized users (e.g. admins visiting student app onboarding)
    redirect("/auth/sign-in?error=unauthorized")
  }

  // If the user has already completed onboarding, redirect to dashboard/home
  if (isSuperAdmin || userWithRoles?.student) {
    redirect("/")
  }

  return <OnboardingForm />
}
