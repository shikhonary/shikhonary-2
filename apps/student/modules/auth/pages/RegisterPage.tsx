'use client';

import React, { useState } from 'react';
import { authClient } from '@workspace/auth/client';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RegisterForm from '../components/RegisterForm';
import VerificationStatusCard from '../components/VerificationStatusCard';
import PhoneOtpVerificationCard from '../components/PhoneOtpVerificationCard';

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
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  identifier: z
    .string()
    .min(1, 'ইমেইল অথবা ফোন নম্বর প্রদান করা আবশ্যক')
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length === 11 || z.string().email().safeParse(val).success;
      },
      { message: 'সঠিক ইমেইল ঠিকানা অথবা ১১ ডিজিটের ফোন নম্বর দিন' }
    ),
  password: z.string().min(8, 'পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে'),
  agreed: z.boolean().refine((val) => val === true, {
    message: 'সামনে এগোতে ব্যবহারের শর্তাবলীতে সম্মত হতে হবে।',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification state
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Phone OTP verification state
  const [isPhoneVerification, setIsPhoneVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');

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
      identifier: '',
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
      const identifier = values.identifier.trim();
      const isPhone = isPhoneNumber(identifier);

      // For phone registration: generate an internal email
      // For email registration: use the email directly
      const email = isPhone
        ? `${identifier.replace(/\D/g, '')}@${PHONE_EMAIL_DOMAIN}`
        : identifier;

      const { data, error: authError } = await authClient.signUp.email({
        name: values.name,
        email,
        password: values.password,
      });

      console.log('Sign up result:', { data, error: authError });

      if (authError) {
        setError(authError.message ?? 'সাইন আপ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        return;
      }

      if (data) {
        if (isPhone) {
          const phoneDigits = identifier.replace(/\D/g, '');
          setPhoneNumber(phoneDigits);
          setRegisteredPassword(values.password);

          // Send OTP code via SMS
          const { error: otpError } = await authClient.phoneNumber.sendOtp({
            phoneNumber: phoneDigits,
          });

          if (otpError) {
            console.error('Failed to send OTP:', otpError);
            setError(otpError.message ?? 'অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু ওটিপি এসএমএস পাঠানো সম্ভব হয়নি। অনুগ্রহ করে পুনরায় পাঠান।');
          }

          setIsPhoneVerification(true);
          setCountdown(60); // 60s countdown for SMS OTP resend
        } else {
          // Email registration: show email verification card
          setRegisteredEmail(identifier);
          setSignUpSuccess(true);
          setCountdown(120); // 2 minute countdown
        }
      }
    } catch (err: any) {
      console.error('Sign up unexpected error:', err);
      setError(err?.message ?? 'একটি অপ্রত্যাশিত সমস্যা ঘটেছে।');
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
        setError(verifyError.message ?? 'ভুল অথবা মেয়াদকোীর্ণ ওটিপি কোড। পুনরায় চেষ্টা করুন।');
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
          setError('ফোন নম্বর সফলভাবে ভেরিফাই হয়েছে! অনুগ্রহ করে লগইন করুন।');
          router.push('/auth/sign-in');
          return;
        }
      }

      router.push('/');
    } catch (err: any) {
      console.error('OTP verify unexpected error:', err);
      setError(err?.message ?? 'ওটিপি ভেরিফিকেশনের সময়ে একটি সমস্যা ঘটেছে।');
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
        setError(otpError.message ?? 'ওটিপি কোড পুনরায় পাঠানো সম্ভব হয়নি।');
      } else {
        setResendSuccess(true);
        setCountdown(60); // 60s countdown
      }
    } catch (err: any) {
      console.error('Resend OTP unexpected error:', err);
      setError(err?.message ?? 'একটি অপ্রত্যাশিত সমস্যা ঘটেছে।');
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

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email: registeredEmail,
        callbackURL: `${window.location.origin}/auth/sign-in?verified=true`,
      });

      console.log('Resend result:', { error: resendError });

      if (resendError) {
        setError(resendError.message ?? 'ভেরিফিকেশন ইমেইল পুনরায় পাঠানো সম্ভব হয়নি।');
      } else {
        setResendSuccess(true);
        setCountdown(120); // Reset to 2 minute countdown
      }
    } catch (err: any) {
      console.error('Resend unexpected error:', err);
      setError(err?.message ?? 'একটি অপ্রত্যাশিত সমস্যা ঘটেছে।');
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

        {/* Register/Verify Card Container */}
        <div className="w-full max-w-[480px] fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 md:p-12 shadow-[0_4px_20px_-2px_rgba(31,41,55,0.08)]">

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
            ) : signUpSuccess ? (
              <VerificationStatusCard
                registeredEmail={registeredEmail}
                resendSuccess={resendSuccess}
                resending={resending}
                error={error}
                countdown={countdown}
                formatTime={formatTime}
                onResend={handleResend}
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