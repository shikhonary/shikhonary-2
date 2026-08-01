import React, { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

import * as z from 'zod';

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  register: UseFormRegister<ResetPasswordInput>;
  errors: FieldErrors<ResetPasswordInput>;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack?: () => void;
}

export default function ResetPasswordForm({
  register,
  errors,
  error,
  loading,
  onSubmit,
  onBack,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex flex-col items-center mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          New Password
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium max-w-xs">
          Please enter and confirm your new password below.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {/* New Password Input */}
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
              placeholder="New Password (Min. 6 characters)"
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

        {/* Confirm Password Input */}
        <div>
          <div
            className={`relative flex items-center border rounded-xl px-3.5 py-3 transition-all bg-white ${
              errors.confirmPassword
                ? 'border-rose-400 ring-2 ring-rose-400/10'
                : 'border-slate-200 focus-within:border-[#c52828] focus-within:ring-2 focus-within:ring-[#c52828]/15'
            }`}
          >
            <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              {...register('confirmPassword')}
              disabled={loading}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              autoComplete="new-password"
              className="w-full text-slate-800 placeholder:text-slate-400 text-sm outline-none bg-transparent pr-8"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#c62828] hover:to-[#a71919] text-white font-bold text-sm tracking-wider shadow-[0_6px_20px_rgba(197,40,40,0.35)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-6"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>UPDATING PASSWORD...</span>
            </>
          ) : (
            <span>UPDATE PASSWORD</span>
          )}
        </button>
      </form>

      {onBack && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer disabled:opacity-50"
          >
            &larr; Back to OTP Verification
          </button>
        </div>
      )}
    </div>
  );
}
