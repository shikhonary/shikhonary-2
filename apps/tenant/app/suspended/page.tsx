import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "পোর্টাল স্থগিত | ইউনিয়ন পরিষদ পোর্টাল",
  description: "এই পোর্টালটি বর্তমানে নিষ্ক্রিয় বা স্থগিত করা হয়েছে।",
};

interface SuspendedPageProps {
  searchParams: Promise<{ reason?: string; detail?: string }>;
}

/**
 * Suspended / inactive page — shown when the tenant's portal is either
 * deactivated (reason=inactive) or suspended (reason=suspended).
 * Receives an optional `detail` param carrying the suspend reason text.
 */
export default async function SuspendedPage({ searchParams }: SuspendedPageProps) {
  const { reason, detail } = await searchParams;
  const isInactive = reason === "inactive";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${
            isInactive ? "bg-muted" : "bg-destructive/10"
          }`}
        >
          <span className="text-4xl">{isInactive ? "⚠️" : "🚫"}</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1
            className={`text-2xl font-bold ${
              isInactive ? "text-foreground" : "text-destructive"
            }`}
          >
            {isInactive ? "পোর্টাল নিষ্ক্রিয়" : "পোর্টাল স্থগিত"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isInactive
              ? "এই পোর্টালটি বর্তমানে নিষ্ক্রিয় করা হয়েছে। বিস্তারিত জানতে প্ল্যাটফর্ম অ্যাডমিনের সাথে যোগাযোগ করুন।"
              : "এই পোর্টালটি সাময়িকভাবে স্থগিত করা হয়েছে। বিস্তারিত জানতে প্ল্যাটফর্ম অ্যাডমিনের সাথে যোগাযোগ করুন।"}
          </p>

          {/* Suspend reason detail */}
          {!isInactive && detail && (
            <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 text-left">
              <span className="font-medium">কারণ:</span> {detail}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
