'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@workspace/auth/client';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileQuestion, GraduationCap, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import RegisterForm from '../components/RegisterForm';
import PhoneOtpVerificationCard from '../components/PhoneOtpVerificationCard';
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

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
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
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreed: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service to continue.',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone OTP verification state
  const [isPhoneVerification, setIsPhoneVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      password: '',
      agreed: false,
    },
  });

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit: SubmitHandler<RegisterInput> = async (values) => {
    setError(null);
    setLoading(true);
    try {
      const phoneDigits = values.phoneNumber.replace(/\D/g, '');
      const email = `${phoneDigits}@${PHONE_EMAIL_DOMAIN}`;

      const { data, error: authError } = await authClient.signUp.email({
        name: values.name,
        email,
        password: values.password,
      });

      console.log('Sign up result:', { data, error: authError });

      if (authError) {
        setError(authError.message ?? 'Sign-up failed. Please try again.');
        return;
      }

      if (data) {
        setPhoneNumber(phoneDigits);
        setRegisteredPassword(values.password);

        // Send OTP code via SMS
        const { error: otpError } = await authClient.phoneNumber.sendOtp({
          phoneNumber: phoneDigits,
        });

        if (otpError) {
          console.error('Failed to send OTP:', otpError);
          setError(otpError.message ?? 'Account created, but failed to send OTP SMS. Please try resending.');
        }

        setIsPhoneVerification(true);
        setCountdown(60); // 60s countdown for SMS OTP resend
      }
    } catch (err: any) {
      console.error('Sign up unexpected error:', err);
      setError(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (codeOrEvent?: string | React.FormEvent) => {
    if (typeof codeOrEvent === 'object' && codeOrEvent && 'preventDefault' in codeOrEvent) {
      codeOrEvent.preventDefault();
    }
    const codeToUse = typeof codeOrEvent === 'string' ? codeOrEvent : otpCode;
    if (!codeToUse || codeToUse.length < 6) return;

    setError(null);
    setLoading(true);
    setResendSuccess(false);

    try {
      // Verify OTP with phone number
      const { data, error: verifyError } = await authClient.phoneNumber.verify({
        phoneNumber,
        code: codeToUse,
      });

      console.log('OTP verify result:', { data, error: verifyError });

      if (verifyError) {
        setError(verifyError.message ?? 'Invalid or expired OTP code. Please try again.');
        return;
      }

      // Automatically sign in after OTP verification
      const { error: signInError } = await authClient.signIn.phoneNumber({
        phoneNumber,
        password: registeredPassword,
      });

      if (signInError) {
        // Fallback: try email-based sign-in with the generated internal email
        const { error: emailSignInError } = await authClient.signIn.email({
          email: `${phoneNumber}@${PHONE_EMAIL_DOMAIN}`,
          password: registeredPassword,
        });

        if (emailSignInError) {
          setError('Phone number verified successfully! Please log in.');
          router.push('/auth/sign-in');
          return;
        }
      }

      router.push('/');
    } catch (err: any) {
      console.error('OTP verify unexpected error:', err);
      setError(err?.message ?? 'An error occurred during OTP verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const { error: otpError } = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });

      if (otpError) {
        setError(otpError.message ?? 'Failed to resend OTP code.');
      } else {
        setResendSuccess(true);
        setCountdown(60); // 60s countdown
      }
    } catch (err: any) {
      console.error('Resend OTP unexpected error:', err);
      setError(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setResending(false);
    }
  };

  const handleBackFromPhoneOtp = () => {
    setIsPhoneVerification(false);
    setOtpCode('');
    setError(null);
    setResendSuccess(false);
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

          {/* ── Right: Register/Verify Card ── */}
          <div className="w-full lg:w-[440px] shrink-0">
            <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
              {isPhoneVerification ? (
                <PhoneOtpVerificationCard
                  phoneNumber={phoneNumber}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  loading={loading}
                  resending={resending}
                  resendSuccess={resendSuccess}
                  error={error}
                  countdown={countdown}
                  formatTime={formatTime}
                  onVerify={handleVerifyPhoneOtp}
                  onResend={handleResendPhoneOtp}
                  onBack={handleBackFromPhoneOtp}
                />
              ) : (
                <RegisterForm
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  control={control}
                  loading={loading}
                  error={error}
                  onSubmit={handleSubmit(onSubmit)}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}