"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  BookOpen,
  Sparkles,
  LayoutGrid,
  ScanLine,
  Globe,
  Share2,
  Coins,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const mobileNavItems = [
  {
    title: "হোম",
    url: "/",
    icon: Home,
  },
  {
    title: "প্রশ্নপত্র",
    url: "/question-papers",
    icon: FileText,
  },
  {
    title: "প্রশ্ন ব্যাংক",
    url: "/question-bank",
    icon: BookOpen,
  },
  {
    title: "সাবস্ক্রিপশন",
    url: "/subscription",
    icon: Sparkles,
  },
];

const MORE_SPEED_DIAL_ITEMS = [
  {
    href: "/omr-verifier",
    icon: ScanLine,
    title: "ওএমআর ভেরিফায়ার",
    subtitle: "ক্যামেরা বা স্ক্যানার দিয়ে খাতা মূল্যায়ন",
    badge: "নতুন",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    href: "/online-exam",
    icon: Globe,
    title: "অনলাইন পরীক্ষা",
    subtitle: "লাইভ বা শিডিউল করা অনলাইন পরীক্ষা পরিচালনা",
    badge: "শিগগিরই",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  {
    href: "/credits",
    icon: Coins,
    title: "ক্রেডিট ও রিচার্জ",
    subtitle: "এআই প্রশ্ন তৈরির ক্রেডিট ওয়ালেট ও টপ-আপ",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    href: "/refer",
    icon: Share2,
    title: "রেফার ও রিওয়ার্ডস",
    subtitle: "অন্য প্রতিষ্ঠান রেফার করে বোনাস ক্রেডিট অর্জন",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    href: "/profile",
    icon: Settings,
    title: "প্রতিষ্ঠান প্রোফাইল",
    subtitle: "প্রতিষ্ঠানের বিবরণ, যোগাযোগ ও ডিজিটাল স্বাক্ষর",
    iconBg: "bg-primary/10 text-primary border-primary/20",
  },
];

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Hide on question paper builder routes (/question-papers/[id]...)
  const isQuestionPaperDetailRoute =
    pathname.startsWith("/question-papers/") &&
    !pathname.startsWith("/question-papers/create");

  if (isQuestionPaperDetailRoute) {
    return null;
  }

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    return pathname === url || pathname.startsWith(url + "/");
  };

  const isMoreActive = MORE_SPEED_DIAL_ITEMS.some((item) => isActive(item.href));

  return (
    <>
      {/* ── More Speed Dial Overlay & Menu ────────────────────────────── */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="absolute bottom-16 inset-x-3 bg-card border border-border/80 rounded-3xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom-5 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border/50 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-sm font-black text-foreground">
                    আরও সুবিধাসমূহ
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-body">
                    দ্রুত অ্যাক্সেস ও অতিরিক্ত সেবা
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Dial Menu Items */}
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-0.5">
              {MORE_SPEED_DIAL_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-2xl transition-all duration-150 active:scale-98 group cursor-pointer",
                      active
                        ? "bg-primary/10 border border-primary/25 text-primary"
                        : "hover:bg-muted/50 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                          item.iconBg
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "text-xs font-bold font-headline truncate leading-tight",
                              active ? "text-primary font-black" : "text-foreground"
                            )}
                          >
                            {item.title}
                          </p>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.2 rounded-md font-bold border leading-none",
                                item.badgeColor
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-body truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Mobile Bottom Bar ────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-2xl border-t border-border/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-3 pt-2 pb-safe">
        <div className="flex items-center justify-between max-w-md mx-auto gap-1">
          {/* Main 4 Quick Nav Items */}
          {mobileNavItems.map((item) => {
            const active = isActive(item.url);
            const Icon = item.icon;

            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => setIsMoreOpen(false)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 relative group active:scale-95 select-none",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Modern Pill Badge Capsule for Active State */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200",
                    active
                      ? "bg-primary text-white shadow-md shadow-primary/25 scale-100"
                      : "group-hover:bg-muted/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4.5 h-4.5 transition-transform duration-200",
                      active ? "text-white" : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                    )}
                  />
                </div>

                {/* Label text */}
                <span
                  className={cn(
                    "text-[10px] tracking-tight truncate max-w-[62px] font-solaiman mt-1 transition-all duration-200",
                    active
                      ? "text-primary font-black"
                      : "text-muted-foreground font-medium group-hover:text-foreground"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}

          {/* 5th Action: More Speed Dial Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 relative group active:scale-95 cursor-pointer select-none",
              isMoreOpen || isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="আরও অপশন দেখুন"
          >
            {/* Modern Pill Badge Capsule for Active / Opened State */}
            <div
              className={cn(
                "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200",
                isMoreOpen
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : isMoreActive
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "group-hover:bg-muted/50"
              )}
            >
              <LayoutGrid
                className={cn(
                  "w-4.5 h-4.5 transition-all duration-200",
                  isMoreOpen
                    ? "rotate-45 text-white"
                    : isMoreActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                )}
              />
            </div>

            <span
              className={cn(
                "text-[10px] tracking-tight truncate max-w-[62px] font-solaiman mt-1 transition-all duration-200",
                isMoreOpen || isMoreActive
                  ? "text-primary font-black"
                  : "text-muted-foreground font-medium group-hover:text-foreground"
              )}
            >
              আরও
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
