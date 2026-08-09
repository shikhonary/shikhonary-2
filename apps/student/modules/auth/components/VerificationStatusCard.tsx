import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, Loader2, Hourglass, Send } from 'lucide-react';

interface VerificationStatusCardProps {
  registeredEmail: string;
  resendSuccess: boolean;
  resending: boolean;
  error: string | null;
  countdown: number;
  formatTime: (seconds: number) => string;
  onResend: () => void;
}

export default function VerificationStatusCard({
  registeredEmail,
  resendSuccess,
  resending,
  error,
  countdown,
  formatTime,
  onResend,
}: VerificationStatusCardProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#c52828]/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-[#c52828]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center mb-3">
          Check your email
        </h1>
        <p className="text-sm text-slate-500 text-center leading-relaxed">
          We sent a verification link to: <br />
          <span className="font-bold text-[#c52828] select-all">{registeredEmail}</span>. <br />
          Please click the link in the email to verify your account.
        </p>
      </div>

      {/* Resend Success Banner */}
      {resendSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>A new verification link has been sent to your email.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 pt-2">
        <button
          type="button"
          disabled={resending || countdown > 0}
          onClick={onResend}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#c62828] hover:to-[#a71919] text-white font-bold text-sm tracking-wider shadow-[0_6px_20px_rgba(197,40,40,0.35)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resending...</span>
            </>
          ) : countdown > 0 ? (
            <>
              <Hourglass className="w-4 h-4 animate-pulse" />
              <span>Resend in {formatTime(countdown)}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Resend email</span>
            </>
          )}
        </button>

        <Link
          href="/auth/sign-in"
          className="w-full py-3.5 px-6 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center font-bold text-sm text-slate-700 text-center"
        >
          Back to Log In
        </Link>
      </div>
    </div>
  );
}
