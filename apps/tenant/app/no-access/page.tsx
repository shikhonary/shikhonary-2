import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "প্রবেশাধিকার নেই | ইউনিয়ন পরিষদ পোর্টাল",
  description: "আপনার অ্যাকাউন্টে কোনো সক্রিয় অ্যাডমিন সদস্যপদ পাওয়া যায়নি।",
};

/**
 * No-access page — shown when a logged-in user has no active ADMIN TenantMember record.
 * Redirected here from the (root) layout instead of rendering raw HTML inline.
 */
export default function NoAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <span className="text-4xl">🔒</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">প্রবেশাধিকার নেই</h1>
          <p className="text-muted-foreground leading-relaxed">
            আপনার অ্যাকাউন্টে কোনো সক্রিয় ইউনিয়ন পরিষদের অ্যাডমিন সদস্যপদ
            পাওয়া যায়নি। অনুগ্রহ করে প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটরের সাথে
            যোগাযোগ করুন।
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            ভিন্ন অ্যাকাউন্ট দিয়ে লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
