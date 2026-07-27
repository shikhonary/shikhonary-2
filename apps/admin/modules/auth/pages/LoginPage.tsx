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

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showVerifiedNotice, setShowVerifiedNotice] = useState(false);
  const [showResetSuccessNotice, setShowResetSuccessNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend verification states
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedNotice(true);
      const timer = setTimeout(() => {
        setShowVerifiedNotice(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
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
    setShowResend(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (authError) {
        if (authError.status === 403 || authError.message?.toLowerCase().includes("verify")) {
          setError("Your email address is not verified. Please verify your email first.");
          setShowResend(true);
        } else {
          setError(authError.message ?? "Failed to log in. Please check your credentials.");
        }
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

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const currentEmail = getValues('email');
      const { error: resendError } = await authClient.sendVerificationEmail({
        email: currentEmail,
        callbackURL: `${window.location.origin}/auth/sign-in?verified=true`,
      });

      if (resendError) {
        setError(resendError.message ?? 'Failed to resend verification email.');
      } else {
        setResendSuccess(true);
        setShowResend(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "An unexpected error occurred.");
    } finally {
      setResending(false);
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
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#c52828] tracking-tight leading-none">Mr. Dr.</div>
              <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase mt-1">Medical Coaching Admin</div>
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
                Admin Portal
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#c52828] leading-tight tracking-tight mb-4">
              Medical Coaching
              <br />
              <span className="text-slate-900">Management</span>
            </h1>

            {/* Tagline */}
            <p className="text-[#7a6565] font-medium text-lg mb-4">
              Management & Operations Control
            </p>

            {/* Description */}
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Centralized administrative workstation for managing medical question banks,
              student examinations, academic class syllabi, and institutional metrics.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#c52828] text-xs font-semibold">
                <FileQuestion className="w-3.5 h-3.5" />
                Question Bank & MCQs
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#c52828] text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                Exams & Assessments
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#c52828] text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                Class Rosters & Users
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
                showVerifiedNotice={showVerifiedNotice}
                showResetSuccessNotice={showResetSuccessNotice}
                resendSuccess={resendSuccess}
                error={error}
                showResend={showResend}
                resending={resending}
                loading={loading}
                onResend={handleResend}
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
            <span>Loading BEC Workstation...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

