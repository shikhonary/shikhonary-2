'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authClient } from '@workspace/auth/client';
import LoginForm from '../components/LoginForm';

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
  identifier: z
    .string()
    .min(1, 'ইমেইল অথবা ফোন নম্বর প্রদান করা আবশ্যক')
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        // Valid if it's an 11-digit phone OR a valid email
        return digitsOnly.length === 11 || z.string().email().safeParse(val).success;
      },
      { message: 'সঠিক ইমেইল ঠিকানা অথবা ১১ ডিজিটের ফোন নম্বর দিন' }
    ),
  password: z.string().min(1, 'পাসওয়ার্ড দেওয়া আবশ্যক'),
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
      identifier: '',
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
      const identifier = values.identifier.trim();
      const isPhone = isPhoneNumber(identifier);

      let data, authError;

      if (isPhone) {
        // Phone + password login
        const phoneDigits = identifier.replace(/\D/g, '');
        const result = await authClient.signIn.phoneNumber({
          phoneNumber: phoneDigits,
          password: values.password,
          rememberMe: values.rememberMe,
        });
        data = result.data;
        authError = result.error;
      } else {
        // Email + password login
        const result = await authClient.signIn.email({
          email: identifier,
          password: values.password,
          rememberMe: values.rememberMe,
        });
        data = result.data;
        authError = result.error;
      }

      if (authError) {
        if (authError.status === 403 || authError.message?.toLowerCase().includes("verify")) {
          setError("আপনার ইমেইল ঠিকানাটি এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে আগে ইমেইল ভেরিফাই করুন।");
          setShowResend(true);
        } else {
          setError(authError.message ?? "লগইন করা সম্ভব হয়নি। আপনার দেওয়া তথ্য যাচাই করুন।");
        }
        return;
      }

      if (data) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message ?? "একটি অপ্রত্যাশিত সমস্যা ঘটেছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const currentIdentifier = getValues('identifier');
      const isPhone = isPhoneNumber(currentIdentifier);
      const email = isPhone
        ? `${currentIdentifier.replace(/\D/g, '')}@${PHONE_EMAIL_DOMAIN}`
        : currentIdentifier;

      const { error: resendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/auth/sign-in?verified=true`,
      });

      if (resendError) {
        setError(resendError.message ?? 'ভেরিফিকেশন ইমেইল পুনরায় পাঠানো সম্ভব হয়নি।');
      } else {
        setResendSuccess(true);
        setShowResend(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "একটি অপ্রত্যাশিত সমস্যা ঘটেছে।");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md font-solaiman overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12 relative">
        {/* Atmospheric Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed-dim/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed-dim/20 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        </div>

        {/* Login Card Container */}
        <div className="w-full max-w-[480px] fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 md:p-12 shadow-[0_4px_20px_-2px_rgba(31,41,55,0.08)]">
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

          {/* Supplemental System Info */}
          <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-on-surface-variant/60">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span className="text-label-sm">এন্ড-টু-এন্ড এনক্রিপ্টেড</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant/60">
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span className="text-label-sm">v2.4.1 (স্টেবল)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
          <span className="text-sm text-on-surface-variant">BEC ওয়ার্কস্টেশন লোড হচ্ছে...</span>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

