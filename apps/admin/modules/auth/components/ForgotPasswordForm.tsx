import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as z from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;


interface ForgotPasswordFormProps {
  register: UseFormRegister<ForgotPasswordInput>;
  errors: FieldErrors<ForgotPasswordInput>;
  success: boolean;
  emailSentTo: string;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotPasswordForm({
  register,
  errors,
  success,
  emailSentTo,
  error,
  loading,
  onSubmit,
}: ForgotPasswordFormProps) {
  if (success) {
    return (
      <div>
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px] text-primary">mail</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface text-center mb-2">
            Check your email
          </h1>
          <p className="font-body-md text-on-surface-variant text-center leading-relaxed">
            We sent a password reset link to <br />
            <span className="font-bold text-primary">{emailSentTo}</span>. <br />
            Please check your inbox and click the link to reset your password.
          </p>
        </div>

        <div className="mt-8">
          <Link
            className="w-full h-14 border border-outline-variant bg-transparent rounded-lg hover:bg-surface-container-low transition-colors duration-200 flex items-center justify-center font-headline-md text-[18px] text-on-surface text-center"
            href="/auth/sign-in"
          >
            Back to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Logo & Header */}
      <div className="flex flex-col items-center mb-10">
        <Image
          alt="Shikhonary Logo"
          src="/logo.jpg"
          width={200}
          height={64}
          priority
          className="h-16 w-auto mb-8 object-contain"
        />
        <h1 className="font-headline-md text-headline-md text-on-surface text-center mb-2">
          Reset Password
        </h1>
        <p className="font-body-md text-on-surface-variant text-center">
          Enter your email to receive a password reset link
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span className="material-symbols-outlined text-[18px] mt-px shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        {/* Email Input */}
        <div className="space-y-1">
          <div className="floating-label-group relative">
            <Input
              {...register('email')}
              disabled={loading}
              className={`w-full h-14 px-4 border bg-card rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all duration-200 outline-none text-on-surface peer placeholder:text-transparent ${
                errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-outline-variant'
              }`}
              id="email"
              placeholder="Email Address"
              type="email"
              autoComplete="email"
            />
            <label
              className="absolute left-4 top-4 text-on-surface-variant transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-container peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-container peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
              htmlFor="email"
            >
              Email Address
            </label>
          </div>
          {errors.email && (
            <p className="text-xs text-destructive pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-14 !text-white font-headline-md text-[18px] bg-primary-container rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
          variant="default"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <span className="material-symbols-outlined text-[20px]">send</span>
            </>
          )}
        </Button>
      </form>

      {/* Back to Login Link */}
      <div className="mt-10 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body-md text-on-surface-variant">
          Remember your password?
          <Link
            className={`text-primary font-bold hover:underline ml-1 ${
              loading ? 'pointer-events-none opacity-50' : ''
            }`}
            href="/auth/sign-in"
            onClick={(e) => loading && e.preventDefault()}
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
