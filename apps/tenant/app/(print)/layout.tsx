import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@workspace/auth/server";
import { db } from "@workspace/db/main";
import { TenantProvider } from "@/modules/layout/ui/components/tenant-provider";

/**
 * Print layout — Auth + TenantProvider only, no sidebar/dashboard shell.
 * Pages in this group render bare white — identical to print preview.
 */
const PrintLayout = async ({ children }: { children: React.ReactNode }) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const membership = await db.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      role: "ADMIN",
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
          upazilaName: true,
          districtName: true,
          divisionName: true,
          unionName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!membership || !membership.tenant.isActive || membership.tenant.isSuspended) {
    redirect("/");
  }

  const { tenant } = membership;

  return (
    <TenantProvider
      tenant={{
        id: tenant.id,
        name: tenant.name,
        nameBn: tenant.nameBn,
        slug: tenant.slug,
        logo: tenant.logo,
        upazilaName: tenant.upazilaName,
        districtName: tenant.districtName,
        divisionName: tenant.divisionName,
        unionName: tenant.unionName,
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
      {children}
    </TenantProvider>
  );
};

export default PrintLayout;
