import React from 'react';
import Link from 'next/link';
import { Mail, Hourglass, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="w-full text-center">
      {/* Icon & Heading */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-6 text-[#c52828] shadow-sm">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Check your email
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[280px]">
          We sent a verification link to <br />
          <span className="font-extrabold text-slate-800 break-all">{registeredEmail}</span>. <br />
          Please click it to activate your account.
        </p>
      </div>

      {/* Resend Success Banner */}
      {resendSuccess && (
        <div className="mb-6 flex items-start gap-3 text-left rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>A new verification link has been sent successfully.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 text-left rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Resend Button */}
        <button
          type="button"
          disabled={resending || countdown > 0}
          onClick={onResend}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#c62828] hover:to-[#a71919] text-white font-bold text-sm tracking-widest uppercase shadow-[0_6px_20px_rgba(197,40,40,0.35)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>RESENDING...</span>
            </>
          ) : countdown > 0 ? (
            <>
              <Hourglass className="w-4 h-4 animate-pulse" />
              <span>Resend in {formatTime(countdown)}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Resend Email</span>
            </>
          )}
        </button>

        {/* Back Link */}
        <Link
          href="/auth/sign-in"
          className="w-full py-3.5 px-6 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center font-bold text-sm tracking-widest uppercase text-slate-700 text-center"
        >
          Back to Log In
        </Link>
      </div>
    </div>
  );
}
