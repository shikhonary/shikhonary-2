import React from 'react';
import Link from 'next/link';
import * as z from 'zod';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Phone, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export const forgotPasswordSchema = z.object({
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
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  register: UseFormRegister<ForgotPasswordInput>;
  errors: FieldErrors<ForgotPasswordInput>;
  success: boolean;
  isPhoneSent: boolean;
  sentTo: string;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotPasswordForm({
  register,
  errors,
  success,
  isPhoneSent,
  sentTo,
  error,
  loading,
  onSubmit,
}: ForgotPasswordFormProps) {
  if (success) {
    return (
      <div>
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Check your Phone
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            We have sent a password reset link via SMS to: <br />
            <span className="font-bold text-[#c52828] text-base block mt-2 mb-2">{sentTo}</span>
            Please tap on the link received in the SMS to reset your password.
          </p>
        </div>

        <div className="mt-8">
          <Link
            className="w-full py-3.5 px-6 border border-slate-200 bg-white rounded-full hover:bg-slate-50 transition-all duration-200 flex items-center justify-center font-bold text-sm text-slate-700 shadow-sm cursor-pointer"
            href="/auth/sign-in"
          >
            Back to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Logo & Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Reset Password
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium max-w-xs">
          Enter your registered phone number to receive a password reset link.
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
        {/* Phone Input */}
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

        {/* Submit Button */}
        <button
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#c62828] hover:to-[#a71919] text-white font-bold text-sm tracking-wider shadow-[0_6px_20px_rgba(197,40,40,0.35)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-4"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SENDING LINK...</span>
            </>
          ) : (
            <>
              <span>SEND RESET LINK</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login Link */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs font-medium text-slate-500">
          Remembered your password?
          <Link
            className={`text-[#c52828] font-bold hover:underline ml-1.5 ${
              loading ? 'pointer-events-none opacity-50' : ''
            }`}
            href="/auth/sign-in"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
