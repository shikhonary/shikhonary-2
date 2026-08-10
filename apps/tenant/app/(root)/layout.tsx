import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@workspace/auth/server";
import { db } from "@workspace/db/main";
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

  // Resolve the user's active ADMIN membership
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
          suspendReason: true,
          upazilaName: true,
          districtName: true,
          divisionName: true,
          unionName: true,
          chairmanName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  // No active admin membership → show no-membership screen
  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">প্রবেশাধিকার নেই</h1>
          <p className="text-muted-foreground">
            আপনার অ্যাকাউন্টে কোনো সক্রিয় ইউনিয়ন পরিষদের অ্যাডমিন সদস্যপদ পাওয়া যায়নি।
            অনুগ্রহ করে প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
          </p>
          <a
            href="/auth/sign-in"
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            ভিন্ন অ্যাকাউন্ট দিয়ে লগইন করুন
          </a>
        </div>
      </div>
    );
  }

  const { tenant } = membership;

  // Tenant inactive
  if (!tenant.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">পোর্টাল নিষ্ক্রিয়</h1>
          <p className="text-muted-foreground">
            <strong>{tenant.nameBn ?? tenant.name}</strong>-এর পোর্টালটি বর্তমানে নিষ্ক্রিয় করা হয়েছে।
            বিস্তারিত জানতে প্ল্যাটফর্ম অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    );
  }

  // Tenant suspended
  if (tenant.isSuspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-destructive">পোর্টাল স্থগিত</h1>
          <p className="text-muted-foreground">
            <strong>{tenant.nameBn ?? tenant.name}</strong>-এর পোর্টালটি সাময়িকভাবে স্থগিত করা হয়েছে।
          </p>
          {tenant.suspendReason && (
            <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              কারণ: {tenant.suspendReason}
            </p>
          )}
        </div>
      </div>
    );
  }

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
        chairmanName: tenant.chairmanName,
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
