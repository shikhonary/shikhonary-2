import React, { useState } from 'react';
import Link from 'next/link';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control } from 'react-hook-form';
import { User, Lock, Eye, EyeOff, Users, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Log In
        </h2>
        <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-extrabold tracking-wider rounded-full uppercase">
          ADMINISTRATIVE ACCESS
        </span>
      </div>

      {/* Email Verified Banner */}
      {showVerifiedNotice && !resendSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>Email verified successfully! You can now log in.</span>
        </div>
      )}

      {/* Password Reset Success Banner */}
      {showResetSuccessNotice && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>Password reset successful! You can now log in with your new password.</span>
        </div>
      )}

      {/* Resend Success Banner */}
      {resendSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>A new verification link has been sent to your email.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          {showResend && (
            <button
              type="button"
              disabled={resending || loading}
              onClick={onResend}
              className="text-xs text-primary font-bold hover:underline self-start ml-7 mt-1 disabled:opacity-50 cursor-pointer"
            >
              {resending ? 'Resending link...' : 'Resend verification link'}
            </button>
          )}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-card ${errors.email
                ? 'border-destructive ring-2 ring-destructive/10'
                : 'border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
              }`}
          >
            <User className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              {...register('email')}
              disabled={loading}
              id="email"
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              className="w-full text-foreground placeholder:text-muted-foreground text-sm outline-none bg-transparent"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1 pl-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-card ${errors.password
                ? 'border-destructive ring-2 ring-destructive/10'
                : 'border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
              }`}
          >
            <Lock className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              {...register('password')}
              disabled={loading}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full text-foreground placeholder:text-muted-foreground text-sm outline-none bg-transparent pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1 pl-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me + Forgot Password Row */}
        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              {...register('rememberMe')}
              id="rememberMe"
              type="checkbox"
              disabled={loading}
              className="w-4 h-4 rounded border-input text-primary accent-primary focus:ring-primary/30 cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me
            </span>
          </label>
          <Link
            href="/auth/forgot-password"
            className={`text-xs font-bold text-primary hover:underline inline-block ${loading ? 'pointer-events-none opacity-50' : ''}`}
          >
            Forgot Password?
          </Link>
        </div>

        {/* LOG IN Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-widest uppercase shadow-[0_6px_20px_rgba(67,56,202,0.25)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>LOGGING IN...</span>
            </>
          ) : (
            <span>LOG IN</span>
          )}
        </button>

      </form>

      {/* Card Footer: Sign Up */}
      <div className="mt-8 text-center text-xs md:text-sm text-muted-foreground font-medium">
        <span>Don&apos;t have an account? </span>
        <Link
          href="/auth/sign-up"
          className={`font-extrabold text-foreground hover:underline ${loading ? 'pointer-events-none opacity-50' : ''
            }`}
        >
          Sign Up.
        </Link>
      </div>
    </div>
  );
}

