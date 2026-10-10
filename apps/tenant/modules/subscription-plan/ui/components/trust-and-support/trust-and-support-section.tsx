"use client"

import React from "react"
import { ShieldCheck, Lock, CreditCard, HelpCircle, PhoneCall, Headphones, ArrowRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

interface TrustAndSupportSectionProps {
  context?: "subscription" | "credits"
}

export const TrustAndSupportSection: React.FC<TrustAndSupportSectionProps> = ({
  context = "subscription",
}) => {
  const isCredits = context === "credits"

  const subscriptionFaqs = [
    {
      q: "সাবস্ক্রিপশন নিলে কি তাৎক্ষণিকভাবে সব ফিচার ও কোটা সক্রিয় হবে?",
      a: "হ্যাঁ, যেকোনো প্ল্যান (শিক্ষক, একাডেমি বা ক্যাম্পাস) নির্বাচন বা আপগ্রেড করার সাথে সাথেই পূর্ণাঙ্গ প্রশ্নভাণ্ডার, প্রশ্নপত্র তৈরি কোটা এবং সংশ্লিষ্ট ফ্রি এআই ক্রেডিট আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে।",
    },
    {
      q: "মাসিক এবং বার্ষিক প্ল্যানের মধ্যে মূল পার্থক্য কী?",
      a: "বার্ষিক প্ল্যান নিলে আপনি সরাসরি ২ মাসের সমপরিমাণ মূল্য সাশ্রয় পাবেন। এছাড়া এককালীন পূর্ণাঙ্গ বার্ষিক প্রশ্নপত্র কোটা ও ১২ মাসের এককালীন ক্রেডিট আপনার ওয়ালেটে একসাথে জমা হবে।",
    },
    {
      q: "চলতি মাসের প্রশ্নপত্র কোটা শেষ হয়ে গেলে কী হবে?",
      a: "কোটা শেষ হলে আপনি যেকোনো সময় উচ্চতর প্যাকেজে আপগ্রেড করতে পারবেন অথবা অতিরিক্ত এআই প্রশ্ন তৈরির জন্য আলাদা ক্রেডিট টপ-আপ প্যাক ব্যবহার করতে পারবেন।",
    },
    {
      q: "ক্যাম্পাস প্যাকে ফুটার ব্র্যান্ডিং কীভাবে লুকানো যায়?",
      a: "ক্যাম্পাস প্যাকে প্রশ্নপত্র ডাউনলোড বা প্রিন্ট করার সময় প্রশ্নপত্র বিল্ডারের সেটিংস থেকে 'অ্যাপ ফুটার ব্র্যান্ডিং প্রদর্শন' অপশনটি আনচেক করলেই 'Powered by Shikhonary' সম্পূর্ণ মুছে গিয়ে আপনার নিজস্ব প্রতিষ্ঠানের প্যাটার্নে প্রশ্ন প্রিন্ট হবে।",
    },
    {
      q: "পরবর্তী সময়ে কি প্ল্যান আপগ্রেড বা ডাউনগ্রেড করা সম্ভব?",
      a: "হ্যাঁ, যেকোনো সময় আপনার চলমান প্ল্যান থেকে উচ্চতর প্ল্যানে (যেমন: শিক্ষক প্যাক থেকে একাডেমি বা ক্যাম্পাস প্যাক) আপগ্রেড করতে পারবেন।",
    },
  ]

  const creditsFaqs = [
    {
      q: "ক্রেডিট কীভাবে খরচ হয় এবং প্রতি প্রশ্নে কত ক্রেডিট কাটে?",
      a: "স্বয়ংক্রিয় এআই প্রশ্ন তৈরিতে প্রশ্নের ধরন অনুযায়ী ক্রেডিট কাটা হয় (যেমন: সাধারণ নৈর্ব্যক্তিক প্রশ্নে ১ ক্রেডিট, সৃজনশীল প্রশ্নে ২-৩ ক্রেডিট)। প্রশ্নপত্র বিল্ডারে তৈরির আগে সম্ভাব্য ক্রেডিট খরচ স্পষ্ট দেখতে পাবেন।",
    },
    {
      q: "ক্রয়কৃত ক্রেডিটের কি কোনো নির্দিষ্ট মেয়াদ বা এক্সপায়ারি ডেট আছে?",
      a: "না! আপনার টপ-আপ করা ক্রেডিটের কোনো মেয়াদ শেষ হওয়ার তারিখ নেই। আপনি যেকোনো সময় যতদিন খুশি নিজের সুবিধামতো এই ক্রেডিট ব্যবহার করতে পারবেন।",
    },
    {
      q: "সাবস্ক্রিপশনের ফ্রি ক্রেডিট এবং রিচার্জ ক্রেডিটের মধ্যে সম্পর্ক কী?",
      a: "প্রতি মাসে সাবস্ক্রিপশন প্ল্যানের সাথে প্রাপ্ত ফ্রি ক্রেডিট প্রথমে খরচ হয়। সেই কোটা শেষ হয়ে গেলে আপনার রিচার্জকৃত পার্সোনাল ওয়ালেট থেকে স্বয়ংক্রিয়ভাবে ক্রেডিট ব্যবহার হবে।",
    },
    {
      q: "টপ-আপ করার পর ক্রেডিট ওয়ালেটে যোগ হতে কতক্ষণ সময় লাগে?",
      a: "বিকাশ, নগদ, রকেট বা কার্ড পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই তাৎক্ষণিকভাবে আপনার ওয়ালেটে মূল ক্রেডিট ও বোনাস ক্রেডিট যোগ হয়ে যায়। কোনো অপেক্ষার প্রয়োজন নেই।",
    },
    {
      q: "কোন ক্রেডিট প্যাকটি আমার প্রতিষ্ঠানের জন্য সবচেয়ে উপযুক্ত?",
      a: "নিয়মিত সাপ্তাহিক বা মাসিক পরীক্ষার জন্য 'স্ট্যান্ডার্ড টপ-আপ' (৫৫০ ক্রেডিট @ ৳৫০০) সবচেয়ে জনপ্রিয়। তবে বড় প্রতিষ্ঠান বা সেমিস্টার পরীক্ষার জন্য 'সুপার সেভার' বা 'মেগা প্রাতিষ্ঠানিক প্যাক'-এ সর্বোচ্চ ২৪% পর্যন্ত ফ্রি বোনাস পাওয়া যায়।",
    },
  ]

  const faqs = isCredits ? creditsFaqs : subscriptionFaqs

  const paymentMethods = [
    { name: "bKash", color: "bg-[#E2136E]/10 text-[#E2136E] border-[#E2136E]/20" },
    { name: "Nagad", color: "bg-[#F7941D]/10 text-[#F7941D] border-[#F7941D]/20" },
    { name: "Rocket", color: "bg-[#8C3494]/10 text-[#8C3494] border-[#8C3494]/20" },
    { name: "BEFTN / NPSB", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
    { name: "Visa / Mastercard", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    { name: "Citytouch & IB", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" },
  ]

  return (
    <div className="space-y-8 pt-4">
      {/* ── 1. Institutional Payment Gateways & Trust Badges ── */}
      <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground font-bold font-headline text-base sm:text-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>নিরাপদ ও অনুমোদিত প্রাতিষ্ঠানিক পেমেন্ট ব্যবস্থা</span>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              বাংলাদেশের সকল শীর্ষ মোবাইল ব্যাংকিং, ব্যাংক ট্রান্সফার ও কার্ডে ১০০% নিরাপদ ও এনক্রিপ্টেড পেমেন্ট
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit SSL সিকিউরড গেটওয়ে</span>
          </div>
        </div>

        {/* Payment Badges Grid */}
        <div className="pt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          {paymentMethods.map((m, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 rounded-2xl border text-xs font-bold font-headline flex items-center gap-2 transition-transform hover:scale-105 select-none ${m.color}`}
            >
              <CreditCard className="w-3.5 h-3.5 opacity-80" />
              <span>{m.name}</span>
            </div>
          ))}
          <span className="text-[11px] text-muted-foreground font-body px-2">
            ও সকল দেশি-বিদেশি ডেবিট/ক্রেডিট কার্ড
          </span>
        </div>
      </div>

      {/* ── 2. Collapsible FAQ Accordion Section ── */}
      <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-foreground pb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-headline">
              {isCredits
                ? "ক্রেডিট সম্পর্কিত সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)"
                : "সাবস্ক্রিপশন ও প্ল্যান সম্পর্কিত প্রশ্নোত্তর (FAQ)"}
            </h3>
            <p className="text-xs text-muted-foreground font-body">
              {isCredits
                ? "ক্রেডিট টপ-আপ, খরচ, বোনাস ও মেয়াদ সম্পর্কিত জরুরি তথ্য"
                : "সাবস্ক্রিপশন, ফিচার ও পেমেন্ট সম্পর্কিত নিয়মিত প্রশ্নোত্তর"}
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-border/50 py-1">
              <AccordionTrigger className="text-sm font-bold font-headline text-foreground hover:no-underline hover:text-indigo-600 dark:hover:text-indigo-400 py-3.5 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed pt-1 pb-3">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* ── 3. Section 7: Interactive Live Support & Contact Bar ── */}
      <div className="relative z-10 bg-linear-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Headphones className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-bold font-headline">
              {isCredits
                ? "ক্রেডিট রিচার্জ বা বাল্ক পারচেজে কোনো সহায়তা প্রয়োজন?"
                : "সঠিক প্ল্যান বেছে নিতে কোনো দ্বিধা রয়েছে?"}
            </h4>
            <p className="text-xs sm:text-sm text-white/80 mt-0.5 font-body">
              {isCredits
                ? "আমাদের প্রাতিষ্ঠানিক সাপোর্ট টিমের সাথে সরাসরি কথা বলে কাস্টম প্যাকেজ নিতে পারেন।"
                : "আমাদের প্রাতিষ্ঠানিক শিক্ষা উপদেষ্টা দলের সাথে সরাসরি কথা বলুন বা ফ্রি ডেমো বুক করুন।"}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
          <a
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-indigo-900 text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all shadow-md cursor-pointer"
            href="tel:+8801800000000"
          >
            <PhoneCall className="w-4 h-4 text-indigo-700" />
            <span>হটলাইন: ০৯৬১১-০০০০০০</span>
          </a>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open("https://wa.me/8801800000000", "_blank")
              }
            }}
          >
            <Headphones className="w-4 h-4" />
            <span>লাইভ চ্যাট শুরু করুন</span>
          </button>
        </div>
      </div>
    </div>
  )
}
