'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileQuestion, GraduationCap, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authClient } from '@workspace/auth/client';
import LoginForm from '../components/LoginForm';
import Image from 'next/image';

/**
 * Domain used for internally-generated emails for phone-based registrations.
 * Must match the value in packages/auth/src/server/auth.ts
 */
const PHONE_EMAIL_DOMAIN = 'phone.bec.local';

/**
 * Check if a string is an 11-digit phone number (digits only).
 */
function isPhoneNumber(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly.length === 11;
}

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length === 11;
      },
      { message: 'Please enter a valid 11-digit phone number' }
    ),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showResetSuccessNotice, setShowResetSuccessNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (searchParams.get('resetSuccess') === 'true') {
      setShowResetSuccessNotice(true);
      const timer = setTimeout(() => {
        setShowResetSuccessNotice(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const onSubmit: SubmitHandler<LoginInput> = async (values) => {
    setError(null);
    setLoading(true);

    try {
      const phoneDigits = values.phoneNumber.replace(/\D/g, '');
      const { data, error: authError } = await authClient.signIn.phoneNumber({
        phoneNumber: phoneDigits,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (authError) {
        setError(authError.message ?? "Failed to log in. Please check your credentials.");
        return;
      }

      if (data) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900">
      <div className="min-h-screen flex items-center justify-center px-4 py-4 sm:px-6 lg:px-16">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

          {/* ── Mobile-only: Branding header (hidden on lg+) ── */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <Image
              src="/logo.jpg"
              alt="Mr. Dr. Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-md"
              width={100}
              height={100}
            />
            <div className="text-center font-solaiman">
              <div className="text-2xl font-extrabold text-[#c52828] tracking-tight leading-none">Mr. Dr.</div>
              <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase mt-1">Student Portal</div>
            </div>
          </div>

          {/* ── Left: Branding & Info (desktop only) ── */}
          <div className="hidden lg:block flex-1 min-w-0">
            {/* Brand Row with logo */}
            <div className="flex items-center gap-3 mb-10">
              <Image
                src="/logo.jpg"
                alt="Mr. Dr. Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-sm"
                width={100}
                height={100}
              />
              <span className="text-2xl font-extrabold text-[#c52828] tracking-tight">Mr. Dr.</span>
              <span className="px-2.5 py-0.5 bg-rose-50 text-[#c52828] text-[11px] font-bold tracking-widest rounded-md border border-rose-100 uppercase">
                Student Portal
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#c52828] leading-tight tracking-tight mb-4">
              Medical Coaching
              <br />
              <span className="text-slate-900">Student Portal</span>
            </h1>

            {/* Tagline */}
            <p className="text-[#7a6565] font-medium text-lg mb-4">
              Exam Preparation & Learning Hub
            </p>

            {/* Description */}
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Access your medical coaching class materials, practice chapter-wise MCQs,
              take online examinations, and check leaderboard standings.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#c52828] text-xs font-semibold">
                <FileQuestion className="w-3.5 h-3.5" />
                MCQ Practice & Tests
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#c52828] text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                Live Exams & Results
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#c52828] text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                Leaderboard & Stats
              </div>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-5 pt-6 border-t border-slate-100 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                256-bit SSL Security
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                v2.4.1 Stable
              </div>
            </div>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="w-full lg:w-[440px] shrink-0">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
              <LoginForm
                register={register}
                errors={errors}
                setValue={setValue}
                control={control}
                showResetSuccessNotice={showResetSuccessNotice}
                error={error}
                loading={loading}
                onSubmit={handleSubmit(onSubmit)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-[#c52828] border-t-transparent rounded-full animate-spin" />
            <span>স্টুডেন্ট পোর্টাল লোড হচ্ছে...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

