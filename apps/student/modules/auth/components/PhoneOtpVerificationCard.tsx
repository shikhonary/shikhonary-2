import React from 'react';
import { Smartphone, CheckCircle2, AlertCircle, Loader2, Hourglass, Send, ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@workspace/ui/components/input-otp';

interface PhoneOtpVerificationCardProps {
  phoneNumber: string;
  otpCode: string;
  setOtpCode: (code: string) => void;
  loading: boolean;
  resending: boolean;
  resendSuccess: boolean;
  error: string | null;
  countdown: number;
  formatTime: (seconds: number) => string;
  title?: string;
  description?: string;
  backText?: string;
  verifyText?: string;
  onVerify: (codeOrEvent?: string | React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}

export default function PhoneOtpVerificationCard({
  phoneNumber,
  otpCode,
  setOtpCode,
  loading,
  resending,
  resendSuccess,
  error,
  countdown,
  formatTime,
  title = "Verify Phone Number",
  description,
  backText = "← Go Back",
  verifyText = "Verify",
  onVerify,
  onResend,
  onBack,
}: PhoneOtpVerificationCardProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#c52828]/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-[#c52828]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center mb-3">
          {title}
        </h1>
        <p className="text-sm text-slate-500 text-center leading-relaxed">
          {description ? (
            description
          ) : (
            <>
              We sent a 6-digit OTP code via SMS to: <br />
              <span className="font-bold text-[#c52828] select-all">{phoneNumber}</span>. <br />
              Enter the code below to complete registration.
            </>
          )}
        </p>
      </div>

      {/* Resend Success Banner */}
      {resendSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>A new OTP code has been sent to your phone.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otpCode.length === 6 && !loading) {
            onVerify(otpCode);
          }
        }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-400 tracking-wider text-center uppercase">
            Verification Code
          </label>
          <div className="flex justify-center">
            <InputOTP
              id="otpCode"
              maxLength={6}
              value={otpCode}
              onChange={(val) => {
                const cleanVal = val.replace(/\D/g, '');
                setOtpCode(cleanVal);
                if (cleanVal.length === 6 && !loading) {
                  onVerify(cleanVal);
                }
              }}
              disabled={loading}
              autoFocus
            >
              <InputOTPGroup className="gap-1.5 min-[375px]:gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-9 h-12 min-[375px]:w-10 min-[375px]:h-13 sm:w-12 sm:h-14 text-xl min-[375px]:text-2xl font-bold rounded-xl border border-slate-200 bg-white focus:border-[#c52828] focus:ring-2 focus:ring-[#c52828]/15 transition-all text-slate-800"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Primary Action Button (Verify / Continue) */}
        <button
          type="submit"
          disabled={loading || resending || otpCode.length < 6}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#c62828] hover:to-[#a71919] text-white font-bold text-sm tracking-wider shadow-[0_6px_20px_rgba(197,40,40,0.35)] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>{verifyText}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Resend OTP Section */}
        <div className="text-center pt-1">
          {resending ? (
            <div className="flex items-center justify-center gap-2 text-sm text-[#c52828]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending OTP...</span>
            </div>
          ) : countdown > 0 ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Hourglass className="w-4 h-4 text-slate-400 animate-pulse shrink-0" />
              <span>Resend OTP in {formatTime(countdown)}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={loading || resending}
              className="text-xs font-bold text-[#c52828] hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 mx-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resend OTP</span>
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full text-center text-xs font-bold text-slate-500 hover:text-[#c52828] transition-colors py-2 cursor-pointer disabled:opacity-50"
        >
          {backText}
        </button>
      </div>
    </div>
  );
}
