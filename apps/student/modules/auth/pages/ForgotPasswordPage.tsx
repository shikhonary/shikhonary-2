'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@workspace/auth/client';
import { FileQuestion, GraduationCap, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ForgotPasswordForm, { forgotPasswordSchema, ForgotPasswordInput } from '../components/ForgotPasswordForm';

/**
 * Domain used for internally-generated emails for phone-based registrations.
 * Must match the value in packages/auth/src/server/auth.ts
 */
const PHONE_EMAIL_DOMAIN = 'phone.bec.local';

type Step = 'IDENTIFIER' | 'SENT';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('IDENTIFIER');
  const [sentTo, setSentTo] = useState('');
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for Phone
  const {
    register: registerIdentifier,
    handleSubmit: handleSubmitIdentifier,
    formState: { errors: errorsIdentifier },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const onSubmitIdentifier: SubmitHandler<ForgotPasswordInput> = async (values) => {
    setError(null);
    setLoading(true);

    try {
      const phoneDigits = values.phoneNumber.replace(/\D/g, '');
      const email = `${phoneDigits}@${PHONE_EMAIL_DOMAIN}`;

      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message ?? 'Failed to send password reset SMS. Please check your number.');
        return;
      }

      setSentTo(values.phoneNumber);
      setIsPhoneSent(true);
      setStep('SENT');
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
              Recover your Account <br />
              <span className="bg-gradient-to-r from-[#c52828] to-[#991b1b] bg-clip-text text-transparent">
                Quickly & Securely.
              </span>
            </h1>
            <p className="text-slate-500 text-base max-w-md mb-10 leading-relaxed font-medium">
              Provide your registered phone number, and we'll send a password recovery SMS link immediately.
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
              <ForgotPasswordForm
                register={registerIdentifier}
                errors={errorsIdentifier}
                success={step === 'SENT'}
                isPhoneSent={isPhoneSent}
                sentTo={sentTo}
                error={error}
                loading={loading}
                onSubmit={handleSubmitIdentifier(onSubmitIdentifier)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
