"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SignUpForm } from "../form/sign-up-form";

export const SignUpView = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex h-screen bg-background font-body overflow-hidden">
      {/* ── Left Decorative Panel — desktop only ── */}
      <div
        aria-hidden="true"
        className="relative overflow-hidden w-0 lg:w-1/2 shrink-0 h-full bg-gradient-to-br from-[#0a1a0b] via-[#122613] to-[#1b5e20]"
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#c62828]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center space-y-8 px-12 py-16 max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-white/5 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[48px]">school</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-white leading-tight">
                শিখনারী পোর্টাল
              </h1>
              <p className="mt-1 text-sm font-medium text-white/60 font-body">
                স্মার্ট শিক্ষা প্রতিষ্ঠান ম্যানেজমেন্ট প্ল্যাটফর্ম
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="w-full space-y-3 text-left">
            {[
              { step: "১", title: "অ্যাকাউন্ট তৈরি করুন", desc: "আপনার প্রতিষ্ঠানের জন্য প্রশাসক অ্যাকাউন্ট নিবন্ধন করুন" },
              { step: "২", title: "প্রতিষ্ঠান তথ্য যোগ করুন", desc: "মৌলিক পরিচিতি, বিভাগ, জেলা ও অন্যান্য তথ্য পূরণ করুন" },
              { step: "৩", title: "পোর্টাল ব্যবহার শুরু করুন", desc: "স্মার্ট এডুকেশন ম্যানেজমেন্ট ড্যাশবোর্ড পরিচালনা করুন" },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/40 font-display text-xs font-bold text-white border border-primary/30 mt-0.5">
                  {step}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-white font-solaiman">{title}</p>
                  <p className="text-xs text-white/55 font-body mt-0.5 font-solaiman">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/40 font-body">
            © ২০২৬ শিখনারী — সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>
      </div>

      {/* ── Right Form Panel — always visible ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 lg:p-12 h-full overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile header — logo + name */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/60 shadow bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">school</span>
            </div>
            <p className="font-display text-base font-black text-foreground leading-tight">
              শিখনারী পোর্টাল
            </p>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              অ্যাকাউন্ট তৈরি করুন ✨
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              শিখনারী পোর্টালে আপনার প্রতিষ্ঠান প্রশাসক অ্যাকাউন্ট নিবন্ধন করুন
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-6 sm:p-8 shadow-sm">
            <SignUpForm isLoading={isLoading} setIsLoading={setIsLoading} />
          </div>

          {/* Footer links */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground font-body">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                প্রবেশ করুন
              </Link>
            </p>
            <p className="text-xs text-muted-foreground font-body">
              সাহায্য প্রয়োজন?{" "}
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                সাপোর্ট টিমের সাথে যোগাযোগ করুন
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
