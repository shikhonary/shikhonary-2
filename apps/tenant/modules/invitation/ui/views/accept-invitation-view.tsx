"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  User,
  Lock,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "sonner";
import { authClient } from "@workspace/auth/client";
import { trpc } from "@/trpc/client";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const newUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে")
      .max(100, "নাম ১০০ অক্ষরের বেশি হতে পারবে না"),
    password: z
      .string()
      .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "পাসওয়ার্ডে অন্তত একটি বড় হাতের অক্ষর, ছোট হাতের অক্ষর এবং সংখ্যা থাকতে হবে",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড দুটি মিলছে না",
    path: ["confirmPassword"],
  });

const existingUserSchema = z.object({
  password: z.string().min(1, "পাসওয়ার্ড প্রয়োজন"),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;
type ExistingUserFormValues = z.infer<typeof existingUserSchema>;

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export const AcceptInvitationView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [mode, setMode] = useState<"new" | "existing">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token via public tRPC query (tRPC v11 / TanStack Query pattern)
  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery({
    ...trpc.invitation.validate.queryOptions({ token }),
    enabled: !!token,
    retry: false,
  });

  // Accept mutation (tRPC v11 / TanStack Query pattern)
  const acceptMutation = useMutation(trpc.invitation.accept.mutationOptions());

  const isDisabled = isSubmitting || acceptMutation.isPending;

  const newUserForm = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  const existingUserForm = useForm<ExistingUserFormValues>({
    resolver: zodResolver(existingUserSchema),
    defaultValues: { password: "" },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNewUserSubmit = async (data: NewUserFormValues) => {
    if (!invitation) return;
    setIsSubmitting(true);

    // 1. Create account
    const { error: signUpError } = await authClient.signUp.email({
      name: data.name,
      email: invitation.email,
      password: data.password,
    });

    if (signUpError) {
      // If already registered, switch to existing user mode
      if (
        signUpError.status === 422 ||
        (signUpError as { code?: string }).code === "USER_ALREADY_EXISTS"
      ) {
        toast.info("এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে। অনুগ্রহ করে লগইন করুন।");
        setMode("existing");
        setIsSubmitting(false);
        return;
      }
      toast.error(signUpError.message || "নিবন্ধন ব্যর্থ হয়েছে");
      setIsSubmitting(false);
      return;
    }

    // 2. Sign in to get a session
    const { error: signInError } = await authClient.signIn.email({
      email: invitation.email,
      password: data.password,
    });

    if (signInError) {
      toast.error(signInError.message || "লগইন ব্যর্থ হয়েছে");
      setIsSubmitting(false);
      return;
    }

    // 3. Accept the invitation (creates TenantMember)
    acceptMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("আমন্ত্রণ সফলভাবে গৃহীত হয়েছে! 🎉");
          setTimeout(() => router.push("/"), 2000);
        },
        onError: (err) => {
          toast.error(err.message || "আমন্ত্রণ গ্রহণ করতে ত্রুটি হয়েছে");
          setIsSubmitting(false);
        },
      },
    );
  };

  const handleExistingUserSubmit = async (data: ExistingUserFormValues) => {
    if (!invitation) return;
    setIsSubmitting(true);

    // 1. Sign in
    const { error: signInError } = await authClient.signIn.email({
      email: invitation.email,
      password: data.password,
    });

    if (signInError) {
      toast.error(
        signInError.message || "লগইন ব্যর্থ হয়েছে। পাসওয়ার্ড সঠিক কিনা দেখুন।",
      );
      setIsSubmitting(false);
      return;
    }

    // 2. Accept the invitation (creates TenantMember)
    acceptMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("আমন্ত্রণ সফলভাবে গৃহীত হয়েছে! 🎉");
          setTimeout(() => router.push("/"), 2000);
        },
        onError: (err) => {
          toast.error(err.message || "আমন্ত্রণ গ্রহণ করতে ত্রুটি হয়েছে");
          setIsSubmitting(false);
        },
      },
    );
  };

  // ── States ────────────────────────────────────────────────────────────────

  // No token in URL
  if (!token) {
    return (
      <ErrorScreen message="আমন্ত্রণ লিংকটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।" />
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="w-full max-w-md mx-4 border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-pulse" />
            </div>
            <p className="mt-6 text-muted-foreground font-medium">
              আপনার আমন্ত্রণপত্র যাচাই করা হচ্ছে...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token error
  if (error || !invitation) {
    return (
      <ErrorScreen
        message={
          (error as Error | null)?.message ||
          "আমন্ত্রণটি পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে।"
        }
      />
    );
  }

  // Success
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md mx-4 border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-3">স্বাগতম!</h2>
            <p className="text-muted-foreground mb-2">
              আপনার আমন্ত্রণ সফলভাবে গ্রহণ করা হয়েছে।
            </p>
            <p className="text-sm text-muted-foreground">
              ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
            </p>
            <div className="mt-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm opacity-90">পরিচালনার জন্য আমন্ত্রণ</p>
              <h1 className="text-2xl font-bold">
                {invitation.tenant.nameBn ?? invitation.tenant.name}
              </h1>
            </div>
          </div>
          <p className="text-sm opacity-90">
            আপনাকে{" "}
            <strong>
              {invitation.tenant.nameBn ?? invitation.tenant.name}
            </strong>
            -এর এডুকেশনাল পোর্টালের অ্যাডমিন হিসেবে যুক্ত হওয়ার
            আমন্ত্রণ জানানো হয়েছে।
          </p>
          {invitation.message && (
            <p className="text-sm opacity-80 mt-2 italic">
              &ldquo;{invitation.message}&rdquo;
            </p>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Role Badge */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">প্রশাসনিক অ্যাক্সেস</p>
              <p className="text-xs text-muted-foreground">
                নাগরিক, সেবা এবং প্রশাসনিক কর্মকাণ্ড পরিচালনা করুন
              </p>
            </div>
            <Badge className="capitalize bg-primary/10 text-primary border-primary/20">
              অ্যাডমিন
            </Badge>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setMode("new")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === "new"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              নতুন অ্যাকাউন্ট
            </button>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setMode("existing")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === "existing"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              বিদ্যমান অ্যাকাউন্ট
            </button>
          </div>

          {/* Invited email (readonly) */}
          <div>
            <label className="text-sm font-medium block mb-1">ইমেইল</label>
            <Input
              value={invitation.email}
              readOnly
              className="h-12 bg-muted/30 cursor-not-allowed"
            />
          </div>

          {/* New User Form */}
          {mode === "new" && (
            <form
              onSubmit={newUserForm.handleSubmit(handleNewUserSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium block mb-1">
                  সম্পূর্ণ নাম
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                    className="pl-10 h-12"
                    disabled={isDisabled}
                    {...newUserForm.register("name")}
                  />
                </div>
                {newUserForm.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {newUserForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  নতুন পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="কমপক্ষে ৮ অক্ষর (বড় হাত, ছোট হাত ও সংখ্যা সহ)"
                    className="pl-10 h-12"
                    disabled={isDisabled}
                    {...newUserForm.register("password")}
                  />
                </div>
                {newUserForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {newUserForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="আপনার পাসওয়ার্ডটি পুনরায় নিশ্চিত করুন"
                    className="pl-10 h-12"
                    disabled={isDisabled}
                    {...newUserForm.register("confirmPassword")}
                  />
                </div>
                {newUserForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {newUserForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gap-2"
                disabled={isDisabled}
              >
                {isDisabled ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    অ্যাকাউন্ট তৈরি করুন ও গ্রহণ করুন{" "}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Existing User Form */}
          {mode === "existing" && (
            <form
              onSubmit={existingUserForm.handleSubmit(handleExistingUserSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium block mb-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="আপনার বিদ্যমান পাসওয়ার্ড লিখুন"
                    className="pl-10 h-12"
                    disabled={isDisabled}
                    {...existingUserForm.register("password")}
                  />
                </div>
                {existingUserForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {existingUserForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gap-2"
                disabled={isDisabled}
              >
                {isDisabled ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    লগইন করুন ও আমন্ত্রণ গ্রহণ করুন{" "}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Error Screen
// ---------------------------------------------------------------------------

function ErrorScreen({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mt-6 mb-3 text-destructive">
            আমন্ত্রণ অকার্যকর
          </h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            ফিরে যান
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
