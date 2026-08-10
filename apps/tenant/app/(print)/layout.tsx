import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@workspace/auth/server";
import { db } from "@workspace/db/main";
import { TenantProvider } from "@/modules/layout/ui/components/tenant-provider";

/**
 * Print layout — TenantProvider only (Auth optional), no sidebar/dashboard shell.
 * Pages in this group render bare white — identical to print preview.
 * This is public to allow scanning QR codes for verification.
 */
const PrintLayout = async ({ children }: { children: React.ReactNode }) => {
  const reqHeaders = await headers();
  
  // 1. Resolve tenant from hostname
  const host = reqHeaders.get("host") || "";
  const parts = host.split(".");
  let slug = "savar"; // default for local testing

  const firstPart = parts[0];
  if (parts.length > 2 && firstPart) {
    slug = firstPart;
  } else {
    const firstTenant = await db.tenant.findFirst({
      where: { isActive: true },
      select: { slug: true }
    });
    if (firstTenant) {
      slug = firstTenant.slug;
    }
  }

  const tenant = await db.tenant.findFirst({
    where: {
      slug,
      isActive: true,
      isSuspended: false,
    },
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
  });

  if (!tenant) {
    notFound();
  }

  // 2. Resolve optional session if available (for UI/auth state)
  const session = await auth.api.getSession({ headers: reqHeaders });
  let membership = null;

  if (session) {
    membership = await db.tenantMember.findFirst({
      where: {
        userId: session.user.id,
        tenantId: tenant.id,
        isActive: true,
      },
      select: {
        id: true,
        role: true,
        joinedAt: true,
      },
    });
  }

  // Fallback / dummy session info for public access
  const resolvedUser = session
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : {
        id: "public",
        name: "Public Viewer",
        email: null,
        image: null,
      };

  const resolvedMembership = membership
    ? {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
      }
    : {
        id: "public",
        role: "PUBLIC",
        joinedAt: new Date(),
      };

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
      membership={resolvedMembership}
      user={resolvedUser}
    >
      {children}
    </TenantProvider>
  );
};

export default PrintLayout;
