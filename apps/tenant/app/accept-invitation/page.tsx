import { Suspense } from "react";
import type { Metadata } from "next";
import { AcceptInvitationView } from "@/modules/invitation/ui/views/accept-invitation-view";

export const metadata: Metadata = {
  title: "আমন্ত্রণ গ্রহণ করুন | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদ পোর্টালে যোগদানের জন্য আমন্ত্রণ পত্র গ্রহণ ও ভেরিফিকেশন প্রক্রিয়া",
};

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-medium">আমন্ত্রণ যাচাই করা হচ্ছে...</div>}>
      <AcceptInvitationView />
    </Suspense>
  );
}
