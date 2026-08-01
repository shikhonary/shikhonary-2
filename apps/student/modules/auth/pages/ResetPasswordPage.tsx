'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@workspace/auth/client';
import { FileQuestion, GraduationCap, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ResetPasswordForm, { resetPasswordSchema, ResetPasswordInput } from '../components/ResetPasswordForm';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : 'Password reset token not found. Please request a new link.'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordInput> = async (values) => {
    if (!token) {
      setError('Password reset token is missing. Please request a new password reset link.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (resetError) {
        setError(resetError.message ?? 'Failed to reset password. The link might have expired.');
      } else {
        router.push('/auth/sign-in?resetSuccess=true');
      }
    } catch (err: any) {
      setError(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900">
      <div className="min-h-screen flex items-center justify-center px-4 py-4 sm:px-6 lg:px-16">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

          {/* ── Mobile-only: Branding header (hidden on lg+) ── */}
          <div className="flex lg:hidden flex-col items-center text-center mt-6 w-full">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                Mr. <span className="text-[#c52828]">Dr.</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#c52828]/10 text-[#c52828] tracking-wide uppercase">
                Student
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Basic Education Care</p>
          </div>

          {/* ── Left Column: Desktop Branding Panel (hidden on mobile) ── */}
          <div className="hidden lg:flex flex-1 flex-col justify-center">
            {/* Branding Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">
                Mr. <span className="text-[#c52828]">Dr.</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200" />
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#c52828]/10 text-[#c52828] tracking-wider uppercase">
                Student Portal
              </span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
              Create your New <br />
              <span className="bg-gradient-to-r from-[#c52828] to-[#991b1b] bg-clip-text text-transparent">
                Secure Password.
              </span>
            </h1>
            <p className="text-slate-500 text-base max-w-md mb-10 leading-relaxed font-medium">
              Keep your credentials strong and updated. Make sure to use at least 8 characters.
            </p>

            {/* Feature List */}
            <div className="space-y-6 max-w-md">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-[#c52828]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm mb-1">Encrypted Sessions</h3>
                  <p className="text-xs text-slate-400 font-medium">All authentication routines are end-to-end protected.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 text-slate-700">
                  <FileQuestion className="w-5 h-5 text-[#c52828]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm mb-1">Need help?</h3>
                  <p className="text-xs text-slate-400 font-medium">Reach out to your batch supervisor for immediate recovery help.</p>
                </div>
              </div>
            </div>

            {/* Desktop Footer Info */}
            <div className="mt-16 pt-6 border-t border-slate-100 flex items-center gap-6 text-slate-400 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                v2.4.1 Stable
              </div>
            </div>
          </div>

          {/* ── Right: Card Container ── */}
          <div className="w-full lg:w-[440px] shrink-0">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
              <ResetPasswordForm
                register={register}
                errors={errors}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-[#c52828] border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
