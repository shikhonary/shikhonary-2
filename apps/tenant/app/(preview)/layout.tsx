import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@workspace/auth/server";
import { db } from "@workspace/db/main";
import { parseTenantHost } from "@workspace/utils";
import { TenantProvider } from "@/modules/layout/ui/components/tenant-provider";

/**
 * Preview layout — TenantProvider only (Auth optional), no sidebar/dashboard shell.
 * Pages in this group render bare white — identical to print preview.
 * This is public to allow scanning QR codes for verification.
 */
const PreviewLayout = async ({ children }: { children: React.ReactNode }) => {
  const reqHeaders = await headers();
  
  // 1. Resolve tenant from hostname using shared parseTenantHost helper.
  const host = reqHeaders.get("host");
  const { slug, customDomain } = parseTenantHost(host, process.env["NEXT_PUBLIC_APP_URL"]);

  let tenantWhere:
    | { slug: string; isActive: boolean; isSuspended: boolean }
    | { customDomain: string; customDomainVerified: boolean; isActive: boolean; isSuspended: boolean }
    | null = null;

  if (slug) {
    tenantWhere = { slug, isActive: true, isSuspended: false };
  } else if (customDomain) {
    tenantWhere = { customDomain, customDomainVerified: true, isActive: true, isSuspended: false };
  } else {
    // Bare localhost (no subdomain) — fall back to the first active tenant.
    const firstTenant = await db.tenant.findFirst({
      where: { isActive: true },
      select: { slug: true },
    });
    if (firstTenant) {
      tenantWhere = { slug: firstTenant.slug, isActive: true, isSuspended: false };
    }
  }

  if (!tenantWhere) {
    notFound();
  }

  const tenant = await db.tenant.findFirst({
    where: tenantWhere,
    select: {
      id: true,
      name: true,
      nameBn: true,
      slug: true,
      logo: true,
      isActive: true,
      isSuspended: true,
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

export default PreviewLayout;
