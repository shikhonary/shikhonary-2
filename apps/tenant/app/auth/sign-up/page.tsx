import type { Metadata } from "next";
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";

export const metadata: Metadata = {
  title: "নিবন্ধন করুন | শিখনারী পোর্টাল",
  description: "শিখনারী পোর্টালে অ্যাডমিন অ্যাকাউন্ট নিবন্ধন করুন",
};

export default function SignUpPage() {
  return <SignUpView />;
}
