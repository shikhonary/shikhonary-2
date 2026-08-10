import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

export const metadata: Metadata = {
  title: "প্রবেশ করুন | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদ প্রবেশ দ্বার",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div>লোড হচ্ছে...</div>}>
      <SignInView />
    </Suspense>
  );
}
