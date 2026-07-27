import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control, useWatch } from 'react-hook-form';
import { LoginInput } from '../pages/LoginPage';

interface LoginFormProps {
  register: UseFormRegister<LoginInput>;
  errors: FieldErrors<LoginInput>;
  setValue: UseFormSetValue<LoginInput>;
  control: Control<LoginInput>;
  showVerifiedNotice: boolean;
  showResetSuccessNotice: boolean;
  resendSuccess: boolean;
  error: string | null;
  showResend: boolean;
  resending: boolean;
  loading: boolean;
  onResend: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  register,
  errors,
  setValue,
  control,
  showVerifiedNotice,
  showResetSuccessNotice,
  resendSuccess,
  error,
  showResend,
  resending,
  loading,
  onResend,
  onSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const rememberMe = useWatch({
    control,
    name: 'rememberMe',
    defaultValue: false,
  });

  return (
    <div>
      {/* Logo & Header */}
      <div className="flex flex-col items-center mb-10">
        <Image
          alt="Basic Education Care Logo"
          src="/logo.jpg"
          width={200}
          height={64}
          priority
          className="h-16 w-auto mb-8 object-contain"
        />
        <h1 className="font-headline-md text-headline-md text-on-surface text-center mb-2">
          স্বাগতম
        </h1>
        <p className="font-body-md text-on-surface-variant text-center">
          <span className="font-bold text-primary">BEC</span> স্টুডেন্ট পোর্টালে প্রবেশ করুন
        </p>
      </div>

      {/* Email Verified Banner */}
      {showVerifiedNotice && !resendSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span className="material-symbols-outlined text-[18px] mt-px shrink-0">check_circle</span>
          <span>ইমেইল ভেরিফিকেশন সফল হয়েছে! এখন লগইন করতে পারেন।</span>
        </div>
      )}

      {/* Password Reset Success Banner */}
      {showResetSuccessNotice && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span className="material-symbols-outlined text-[18px] mt-px shrink-0">check_circle</span>
          <span>পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</span>
        </div>
      )}

      {/* Resend Success Banner */}
      {resendSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span className="material-symbols-outlined text-[18px] mt-px shrink-0">check_circle</span>
          <span>আপনার ইমেইলে নতুন ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে।</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] mt-px shrink-0">error</span>
            <span>{error}</span>
          </div>
          {showResend && (
            <button
              type="button"
              disabled={resending || loading}
              onClick={onResend}
              className="text-xs text-primary font-bold hover:underline self-start ml-7 mt-1 disabled:opacity-50"
            >
              {resending ? 'লিঙ্ক পুনরায় পাঠানো হচ্ছে...' : 'ভেরিফিকেশন লিঙ্ক পুনরায় পাঠান'}
            </button>
          )}
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        {/* Email or Phone Input */}
        <div className="space-y-1">
          <div className="floating-label-group relative">
            <Input
              {...register('identifier')}
              disabled={loading}
              className={`w-full h-14 px-4 border bg-white rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all duration-200 outline-none text-on-surface peer placeholder:text-transparent ${errors.identifier ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-outline-variant'
                }`}
              id="identifier"
              placeholder="ইমেইল অথবা ফোন নম্বর"
              type="text"
              autoComplete="email tel"
            />
            <label
              className="absolute left-4 top-4 text-on-surface-variant transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-container peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-container peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
              htmlFor="identifier"
            >
              ইমেইল অথবা ফোন নম্বর
            </label>
          </div>
          {errors.identifier && (
            <p className="text-xs text-red-500 pl-1">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="floating-label-group relative">
              <Input
                {...register('password')}
                disabled={loading}
                className={`w-full h-14 pl-4 pr-12 border bg-white rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all duration-200 outline-none text-on-surface peer placeholder:text-transparent ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-outline-variant'
                  }`}
                id="password"
                placeholder="পাসওয়ার্ড"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
              />
              <label
                className="absolute left-4 top-4 text-on-surface-variant transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-container peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-container peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                htmlFor="password"
              >
                পাসওয়ার্ড
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface select-none focus:outline-none flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 pl-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                className="w-4 h-4 rounded border-outline text-primary-container data-checked:bg-primary-container data-checked:border-primary-container focus:ring-primary-container cursor-pointer"
                checked={rememberMe}
                disabled={loading}
                onCheckedChange={(v) => setValue('rememberMe', v === true)}
              />
              <span className="text-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                মনে রাখুন
              </span>
            </label>
            <Link className={`text-label-sm text-primary hover:underline font-medium ${loading ? 'pointer-events-none opacity-50' : ''}`} href="/auth/forgot-password">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
        </div>


        {/* Login Button */}
        <Button
          className="w-full h-14 !text-white font-headline-md text-[18px] bg-primary-container rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
          variant="default"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              <span>যাচাই করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>লগইন করুন</span>
              <span className="material-symbols-outlined text-[20px]">login</span>
            </>
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-10 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body-md text-on-surface-variant">
          কোনো অ্যাকাউন্ট নেই?
          <Link
            className={`text-primary font-bold hover:underline ml-1 ${loading ? 'pointer-events-none opacity-50' : ''
              }`}
            href="/auth/sign-up"
            onClick={(e) => loading && e.preventDefault()}
            prefetch
          >
            সাইন আপ করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
