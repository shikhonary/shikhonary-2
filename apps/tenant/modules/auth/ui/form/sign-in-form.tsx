"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@workspace/auth/client";
import { GoogleButton } from "../components/google-button";

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

      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("Sign in error:", result.error);
        toast.error(result.error.message || "লগইন করতে ব্যর্থ হয়েছে");
        return;
      }

      if (result.data?.user) {
        toast.success("সফলভাবে লগইন করা হয়েছে!");
        const callbackUrl = searchParams.get("callbackUrl") || "/";
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

  return (
    <div className="animate-fade-in space-y-6">
      <GoogleButton isLoading={isLoading} />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <span className="relative bg-card px-3 text-xs font-medium text-muted-foreground">
          অথবা ইমেইল দিয়ে প্রবেশ করুন
        </span>
      </div>

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
              placeholder="পাসওয়ার্ড লিখুন"
              className="pl-9 pr-10 h-11 rounded-xl border-border/60 bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
          className="w-full h-11 rounded-xl font-display font-bold text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
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
