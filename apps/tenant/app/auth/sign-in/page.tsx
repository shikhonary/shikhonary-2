import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

export const metadata: Metadata = {
  title: "প্রবেশ করুন | শিখনারী পোর্টাল",
  description: "শিখনারী এডুকেশনাল পোর্টাল প্রবেশদ্বার",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div>লোড হচ্ছে...</div>}>
      <SignInView />
    </Suspense>
  );
}
