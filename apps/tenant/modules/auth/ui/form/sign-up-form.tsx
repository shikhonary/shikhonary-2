"use client";

import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2, MailCheck, RefreshCw, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@workspace/auth/client";
import { trpc } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface SignUpProps {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const toBengaliDigits = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char, 10)] : char))
    .join("");
};

const schema = z.object({
  name: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে"),
});

type SignUpFormValues = z.infer<typeof schema>;

export const SignUpForm = ({ isLoading, setIsLoading }: SignUpProps) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isDev = process.env.NODE_ENV !== "production";

  // Dev auto-verify mutation for effortless local testing
  const devVerifyMutation = useMutation(
    trpc.user.devVerifyEmail.mutationOptions({
      onSuccess: () => {
        toast.success("অ্যাকাউন্ট ভেরিফিকেশন সফল হয়েছে! এখন লগইন করুন।");
        router.push("/auth/sign-in?verified=true");
      },
      onError: (err: any) => {
        toast.error(err?.message || "ভেরিফিকেশন সম্পন্ন করা যায়নি।");
      },
    })
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);

      const appUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_TENANT_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3001";

      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: `${appUrl.replace(/\/$/, "")}/auth/sign-in?verified=true`,
      });

      if (result.error) {
        console.error("Sign up error:", result.error);
        toast.error(result.error.message || "অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে");
        return;
      }

      if (result.data?.user) {
        setRegisteredEmail(data.email);
        setIsVerificationSent(true);
        setResendCooldown(60);
        toast.success("অ্যাকাউন্ট তৈরি সফল হয়েছে! যাচাইকরণ ইমেইল পাঠানো হয়েছে।");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(
        error.message || "একটি অনাকাঙ্ক্ষিত সমস্যা ঘটেছে। পুনরায় চেষ্টা করুন।"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    try {
      setIsResending(true);
      const appUrl =
        process.env.NEXT_PUBLIC_TENANT_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");
      const res = await authClient.sendVerificationEmail({
        email: registeredEmail,
        callbackURL: `${appUrl.replace(/\/$/, "")}/auth/sign-in?verified=true`,
      });
      if (res.error) {
        toast.error(res.error.message || "ইমেইল পুনরায় পাঠাতে ব্যর্থ হয়েছে।");
      } else {
        toast.success("যাচাইকরণ ইমেইল পুনরায় সফলভাবে পাঠানো হয়েছে!");
        setResendCooldown(60);
      }
    } catch (e: any) {
      toast.error(e?.message || "একটি অনাকাঙ্ক্ষিত সমস্যা ঘটেছে।");
    } finally {
      setIsResending(false);
    }
  };

  // If account is created and awaiting verification, show clear verification instructions
  if (isVerificationSent) {
    return (
      <div className="space-y-5 animate-fade-in text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary mx-auto shadow-xs">
          <MailCheck className="w-7 h-7 stroke-[1.8]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
            ইমেইল যাচাইকরণ আবশ্যক
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-sm mx-auto">
            আমরা আপনার <strong className="text-foreground font-semibold">{registeredEmail}</strong> ঠিকানায় একটি যাচাইকরণ লিংক পাঠিয়েছি। লগইন করার পূর্বে অনুগ্রহ করে আপনার ইনবক্স চেক করে লিংকটিতে ক্লিক করুন।
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-left space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs font-headline">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ইমেইল খুঁজে পাচ্ছেন না?</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-body">
            ইমেইল কখনো স্প্যাম (Spam) বা জাঙ্ক ফোল্ডারে যেতে পারে। কিছুক্ষণ অপেক্ষা করার পরও না পেলে নিচের বোতাম চেপে পুনরায় পাঠান।
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending || resendCooldown > 0}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-headline text-xs sm:text-sm gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>পাঠানো হচ্ছে...</span>
              </>
            ) : resendCooldown > 0 ? (
              <span>পুনরায় পাঠানোর অপেক্ষা ({toBengaliDigits(resendCooldown)} সে.)</span>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় যাচাইকরণ ইমেইল পাঠান</span>
              </>
            )}
          </Button>

          {/* Development Quick-Verify Helper for Test Mode */}
          {isDev && (
            <Button
              type="button"
              variant="outline"
              onClick={() => devVerifyMutation.mutate({ email: registeredEmail })}
              disabled={devVerifyMutation.isPending}
              className="w-full h-10.5 rounded-xl border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 text-indigo-700 dark:text-indigo-300 font-bold font-headline text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              {devVerifyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ভেরিফাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>ডেভেলপমেন্ট তাৎক্ষণিক ভেরিফাই (Test Mode)</span>
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            asChild
            className="w-full h-10.5 rounded-xl text-foreground font-bold font-headline text-xs cursor-pointer"
          >
            <Link href="/auth/sign-in">
              <span>লগইন পেজে যান</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block font-body">
            পুরো নাম
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-name"
              type="text"
              placeholder="আপনার পুরো নাম লিখুন"
              className="pl-9 h-11 rounded-xl border-border/60 bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isLoading}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive font-medium font-body">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block font-body">
            ইমেইল ঠিকানা
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-email"
              type="email"
              placeholder="আপনার ইমেইল ঠিকানা লিখুন"
              className="pl-9 h-11 rounded-xl border-border/60 bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium font-body">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block font-body">
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড তৈরি করুন"
              className="pl-9 pr-10 h-11 rounded-xl border-border/60 bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium font-body">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          id="signup-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl font-display font-bold text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "অ্যাকাউন্ট তৈরি করুন"
          )}
        </Button>

        {/* Legal */}
        <p className="text-xs text-center text-muted-foreground font-body leading-relaxed">
          নিবন্ধন করে আপনি আমাদের{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            সেবার শর্তাবলী
          </Link>{" "}
          এবং{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            গোপনীয়তা নীতি
          </Link>{" "}
          মেনে নিচ্ছেন।
        </p>
      </form>
    </div>
  );
};
