import React, { useState } from 'react';
import Link from 'next/link';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control, useWatch } from 'react-hook-form';
import { User, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
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
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign Up
        </h2>
        <span className="px-3 py-1 bg-[#e2e8f0]/80 text-[#5c6b79] text-[10px] font-extrabold tracking-wider rounded-full uppercase">
          CREATE ACCOUNT
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        
        {/* Full Name Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-white ${
              errors.name
                ? 'border-rose-400 ring-2 ring-rose-400/10'
                : 'border-slate-200 focus-within:border-[#c52828] focus-within:ring-2 focus-within:ring-[#c52828]/15'
            }`}
          >
            <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              {...register('name')}
              disabled={loading}
              id="fullName"
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              className="w-full text-slate-800 placeholder:text-slate-400 text-sm outline-none bg-transparent"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-white ${
              errors.phoneNumber
                ? 'border-rose-400 ring-2 ring-rose-400/10'
                : 'border-slate-200 focus-within:border-[#c52828] focus-within:ring-2 focus-within:ring-[#c52828]/15'
            }`}
          >
            <Phone className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              {...register('phoneNumber')}
              disabled={loading}
              id="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              autoComplete="tel"
              className="w-full text-slate-800 placeholder:text-slate-400 text-sm outline-none bg-transparent"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-white ${
              errors.password
                ? 'border-rose-400 ring-2 ring-rose-400/10'
                : 'border-slate-200 focus-within:border-[#c52828] focus-within:ring-2 focus-within:ring-[#c52828]/15'
            }`}
          >
            <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              {...register('password')}
              disabled={loading}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (Min. 6 characters)"
              autoComplete="new-password"
              className="w-full text-slate-800 placeholder:text-slate-400 text-sm outline-none bg-transparent pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.password.message}</p>
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
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#c52828] accent-[#c52828] focus:ring-[#c52828]/30 cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors leading-tight">
              I agree to the{' '}
              <Link href="/terms-of-service" className="text-[#c52828] font-bold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-[#c52828] font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.agreed && (
            <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.agreed.message}</p>
          )}
        </div>

        {/* SIGN UP Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#c62828] hover:to-[#a71919] text-white font-bold text-sm tracking-wider shadow-[0_6px_20px_rgba(197,40,40,0.35)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-6"
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
      <div className="mt-8 text-center text-xs md:text-sm text-slate-500 font-medium">
        <span>Already have an account? </span>
        <Link
          href="/auth/sign-in"
          className={`font-extrabold text-slate-900 hover:underline ${
            loading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Log In.
        </Link>
      </div>
    </div>
  );
}
