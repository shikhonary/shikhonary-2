"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@workspace/auth/client";
import { trpc } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface SignInProps {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে"),
});

type SignInFormValues = z.infer<typeof schema>;

export const SignInForm = ({ isLoading, setIsLoading }: SignInProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const isVerifiedCallback = searchParams.get("verified") === "true";
  const isDev = process.env.NODE_ENV !== "production";

  // Dev auto-verify mutation for local testing
  const devVerifyMutation = useMutation(
    trpc.user.devVerifyEmail.mutationOptions({
      onSuccess: () => {
        toast.success("অ্যাকাউন্ট ভেরিফিকেশন সফল হয়েছে! এখন পাসওয়ার্ড দিয়ে লগইন করুন।");
        setUnverifiedEmail(null);
      },
      onError: (err: any) => {
        toast.error(err?.message || "ভেরিফিকেশন সম্পন্ন করা যায়নি।");
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setIsLoading(true);
      setUnverifiedEmail(null);

      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("Sign in error:", result.error);
        const errMsg = result.error.message || "";
        const errCode = (result.error as any).code || "";

        if (
          errCode === "EMAIL_NOT_VERIFIED" ||
          errMsg.toLowerCase().includes("not verified") ||
          errMsg.toLowerCase().includes("verify your email")
        ) {
          setUnverifiedEmail(data.email);
          toast.error("আপনার ইমেইলটি এখনো যাচাই করা হয়নি। দয়া করে ইনবক্স চেক করুন।");
          return;
        }

        toast.error(errMsg || "লগইন করতে ব্যর্থ হয়েছে");
        return;
      }

      if (result.data?.user) {
        toast.success("সফলভাবে লগইন করা হয়েছে!");
        const callbackUrl =
          searchParams.get("callbackUrl") ||
          searchParams.get("callbackURL") ||
          "/";
        router.push(callbackUrl);
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(
        error.message || "একটি অনাকাঙ্ক্ষিত সমস্যা ঘটেছে। পুনরায় চেষ্টা করুন।"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    try {
      setIsResending(true);
      const appUrl =
        process.env.NEXT_PUBLIC_TENANT_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");
      const res = await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: `${appUrl.replace(/\/$/, "")}/auth/sign-in?verified=true`,
      });
      if (res.error) {
        toast.error(res.error.message || "যাচাইকরণ লিংক পাঠাতে ব্যর্থ হয়েছে।");
      } else {
        toast.success("যাচাইকরণ লিংক পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স চেক করুন।");
      }
    } catch (e: any) {
      toast.error(e?.message || "একটি অনাকাঙ্ক্ষিত সমস্যা ঘটেছে।");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Verified Notice Banner */}
      {isVerifiedCallback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold font-headline flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>আপনার ইমেইল সফলভাবে যাচাই করা হয়েছে! অনুগ্রহ করে লগইন করুন।</span>
        </div>
      )}

      {/* Unverified Warning & Action Box */}
      {unverifiedEmail && (
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 space-y-2.5">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs font-headline">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ইমেইল যাচাইকরণ বাকি রয়েছে</span>
          </div>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            <strong className="text-foreground">{unverifiedEmail}</strong> অ্যাকাউন্টের ইমেইল এখনো যাচাই করা হয়নি।
          </p>

          <div className="space-y-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full h-9.5 rounded-lg border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 font-bold font-headline text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              {isResending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>যাচাইকরণ লিংক পুনরায় পাঠান</span>
            </Button>

            {/* Development Quick-Verify Helper for Test Mode */}
            {isDev && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => devVerifyMutation.mutate({ email: unverifiedEmail })}
                disabled={devVerifyMutation.isPending}
                className="w-full h-9.5 rounded-lg border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 text-indigo-700 dark:text-indigo-300 font-bold font-headline text-xs gap-1.5 cursor-pointer shadow-2xs"
              >
                {devVerifyMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>তাৎক্ষণিক ভেরিফাই করুন (Test Mode)</span>
              </Button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block font-body">
            ইমেইল ঠিকানা
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signin-email"
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
              id="signin-password"
              type={showPassword ? "text" : "password"}
              placeholder="আপনার পাসওয়ার্ড লিখুন"
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
          id="signin-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl font-display font-bold text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "প্রবেশ করুন"
          )}
        </Button>
      </form>
    </div>
  );
};
