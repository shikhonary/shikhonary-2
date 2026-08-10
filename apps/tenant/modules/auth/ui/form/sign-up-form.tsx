"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@workspace/auth/client";

interface SignUpProps {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  name: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে"),
});

type SignUpFormValues = z.infer<typeof schema>;

export const SignUpForm = ({ isLoading, setIsLoading }: SignUpProps) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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

      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("Sign up error:", result.error);
        toast.error(result.error.message || "অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে");
        return;
      }

      if (result.data?.user) {
        toast.success("সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!");
        router.push("/");
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
          id="signup-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl font-display font-bold text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
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
