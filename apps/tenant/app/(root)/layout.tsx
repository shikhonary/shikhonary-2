import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@workspace/auth/server";
import { db } from "@workspace/db/main";
import { parseTenantHost } from "@workspace/utils";
import { DashboardLayout } from "@/modules/layout/ui/layout/dashboard-layout";
import { TenantProvider } from "@/modules/layout/ui/components/tenant-provider";

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout — Server Component auth gate for the tenant app.
 *
 * Authorization steps:
 *  1. Resolve Better Auth session from request cookies.
 *  2. Redirect unauthenticated users to /auth/sign-in.
 *  3. Query the user's TenantMember record (must be active + ADMIN role).
 *  4. Verify the tenant is active and not suspended.
 *  5. Pass tenant context to child components via TenantProvider.
 *
 * The tRPC `tenantMemberProcedure` independently enforces the same rules
 * on every API call (defense-in-depth).
 */
const Layout = async ({ children }: RootLayoutProps) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Resolve the tenant from the Host header so that visiting
  // savar.localhost:3001 always shows Savar's data, even if the user is
  // also an admin of another tenant.
  const host = reqHeaders.get("host");
  const { slug, customDomain } = parseTenantHost(host, process.env["NEXT_PUBLIC_APP_URL"]);

  // Build a tenant filter matching what the browser is actually requesting.
  // When on bare localhost (no subdomain) fall back to the user's first
  // ADMIN membership so that local tooling and curl still work.
  type TenantFilter =
    | { slug: string; isActive: true; isSuspended: false }
    | { customDomain: string; customDomainVerified: true; isActive: true; isSuspended: false }
    | undefined;

  const tenantFilter: TenantFilter = slug
    ? { slug, isActive: true, isSuspended: false }
    : customDomain
      ? { customDomain, customDomainVerified: true, isActive: true, isSuspended: false }
      : undefined;

  // Resolve the user's active ADMIN membership for THIS tenant
  const membership = await db.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      role: "ADMIN",
      ...(tenantFilter ? { tenant: tenantFilter } : {}),
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      tenant: {
        select: {
          id: true,
          name: true,
          nameBn: true,
          slug: true,
          logo: true,
          isActive: true,
          isSuspended: true,
          suspendReason: true,
          principalName: true,
          phone: true,
          email: true,
          divisionId: true,
          districtId: true,
          upazilaId: true,
          unionId: true,
          division: { select: { name: true, nameBn: true } },
          district: { select: { name: true, nameBn: true } },
          upazila: { select: { name: true, nameBn: true } },
          union: { select: { name: true, nameBn: true } },
        },
      },
    },
  });

  // No active admin membership → redirect to no-access page
  if (!membership) {
    redirect("/no-access");
  }


  const { tenant } = membership;

  // Tenant inactive → redirect to suspended page
  if (!tenant.isActive) {
    redirect("/suspended?reason=inactive");
  }

  // Tenant suspended → redirect to suspended page with reason
  if (tenant.isSuspended) {
    const params = new URLSearchParams({ reason: "suspended" });
    if (tenant.suspendReason) params.set("detail", tenant.suspendReason);
    redirect(`/suspended?${params.toString()}`);
  }


  return (
    <TenantProvider
      tenant={{
        id: tenant.id,
        name: tenant.name,
        nameBn: tenant.nameBn,
        slug: tenant.slug,
        logo: tenant.logo,
        divisionId: tenant.divisionId,
        districtId: tenant.districtId,
        upazilaId: tenant.upazilaId,
        unionId: tenant.unionId,
        upazilaName: tenant.upazila?.name,
        districtName: tenant.district?.name,
        divisionName: tenant.division?.name,
        unionName: tenant.union?.name,
        divisionNameBn: tenant.division?.nameBn,
        districtNameBn: tenant.district?.nameBn,
        upazilaNameBn: tenant.upazila?.nameBn,
        unionNameBn: tenant.union?.nameBn,
        chairmanName: tenant.principalName,
        phone: tenant.phone,
        email: tenant.email,
      }}
      membership={{
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
      }}
      user={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    >
      <DashboardLayout>{children}</DashboardLayout>
    </TenantProvider>
  );
};

export default Layout;
