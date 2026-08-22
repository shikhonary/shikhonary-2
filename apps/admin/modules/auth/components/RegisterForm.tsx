import React, { useState } from 'react';
import Link from 'next/link';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control, useWatch } from 'react-hook-form';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { RegisterInput } from '../pages/RegisterPage';

interface RegisterFormProps {
  register: UseFormRegister<RegisterInput>;
  errors: FieldErrors<RegisterInput>;
  setValue: UseFormSetValue<RegisterInput>;
  control: Control<RegisterInput>;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  register,
  errors,
  setValue,
  control,
  loading,
  error,
  onSubmit,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const agreed = useWatch({
    control,
    name: 'agreed',
    defaultValue: false,
  });

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Sign Up
        </h2>
        <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-extrabold tracking-wider rounded-full uppercase">
          CREATE ACCOUNT
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        
        {/* Full Name Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-card ${
              errors.name
                ? 'border-destructive ring-2 ring-destructive/10'
                : 'border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
            }`}
          >
            <User className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              {...register('name')}
              disabled={loading}
              id="fullName"
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              className="w-full text-foreground placeholder:text-muted-foreground text-sm outline-none bg-transparent"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive mt-1 pl-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-card ${
              errors.email
                ? 'border-destructive ring-2 ring-destructive/10'
                : 'border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
            }`}
          >
            <Mail className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
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
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-card ${
              errors.password
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
              placeholder="Password (Min. 8 characters)"
              autoComplete="new-password"
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

        {/* Terms Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreed}
              disabled={loading}
              onChange={(e) => setValue('agreed', e.target.checked, { shouldValidate: true })}
              className="w-4 h-4 mt-0.5 rounded border-input text-primary accent-primary focus:ring-primary/30 cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
              I agree to the{' '}
              <Link href="/terms-of-service" className="text-primary font-bold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-primary font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.agreed && (
            <p className="text-xs text-destructive mt-1 pl-1 font-medium">{errors.agreed.message}</p>
          )}
        </div>

        {/* SIGN UP Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-widest uppercase shadow-[0_6px_20px_rgba(67,56,202,0.25)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>CREATING ACCOUNT...</span>
            </>
          ) : (
            <span>SIGN UP</span>
          )}
        </button>

      </form>

      {/* Card Footer: Log In */}
      <div className="mt-8 text-center text-xs md:text-sm text-muted-foreground font-medium">
        <span>Already have an account? </span>
        <Link
          href="/auth/sign-in"
          className={`font-extrabold text-foreground hover:underline ${
            loading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Log In.
        </Link>
      </div>
    </div>
  );
}
