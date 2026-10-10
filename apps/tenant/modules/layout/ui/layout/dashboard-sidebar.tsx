"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Hash,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Settings,
  FileText,
  BookOpen,
  Coins,
  Sparkles,
  ScanLine,
  Globe,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { authClient } from "@workspace/auth/client";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@workspace/ui/components/tooltip";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

type NavGroup = {
  groupLabel: string;
  items: NavItem[];
};

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  onToggle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant, user } = useTenant();
  const { data: creditData } = useQuery(trpc.credit.getBalance.queryOptions());

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/auth/sign-in");
  };

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    return pathname === url || pathname.startsWith(url + "/");
  };

  const navGroups: NavGroup[] = [
    {
      groupLabel: "প্রধান",
      items: [
        { href: "/", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
      ],
    },
    {
      groupLabel: "অ্যাকাডেমিক ও মূল্যায়ন",
      items: [
        { href: "/question-bank", label: "প্রশ্ন ব্যাংক", icon: BookOpen },
        { href: "/question-papers", label: "প্রশ্নপত্র", icon: FileText },
        { href: "/omr-verifier", label: "ওএমআর ভেরিফায়ার", icon: ScanLine, badge: "নতুন" },
        { href: "/online-exam", label: "অনলাইন পরীক্ষা", icon: Globe, badge: "শিগগিরই" },
      ],
    },
    {
      groupLabel: "বিলিং ও রিওয়ার্ডস",
      items: [
        { href: "/subscription", label: "সাবস্ক্রিপশন ও প্ল্যান", icon: Sparkles },
        { href: "/refer", label: "রেফার ও রিওয়ার্ডস", icon: Share2 },
      ],
    },
    {
      groupLabel: "সেটিংস",
      items: [
        { href: "/profile", label: "প্রতিষ্ঠান প্রোফাইল", icon: Settings },
      ],
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <nav
        className={`h-screen fixed left-0 top-0 bg-card border-r border-border hidden md:flex flex-col z-50 transition-all duration-300 shadow-xs ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className={`h-16 flex items-center px-3.5 border-b border-border/60 shrink-0 relative ${collapsed ? "justify-center" : "justify-between gap-2.5"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-indigo-500/20 flex items-center justify-center bg-indigo-500/10 shadow-2xs">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-headline text-sm font-bold text-foreground leading-tight truncate">
                  {tenant.nameBn || tenant.name}
                </h1>
                <p className="font-body text-indigo-600 dark:text-indigo-400 font-bold text-[10px] tracking-wide flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block animate-pulse"></span>
                  শিখনারী পোর্টাল
                </p>
              </div>
            )}
          </div>

          {onToggle && (
            <button
              onClick={onToggle}
              className={`p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer shrink-0 ${
                collapsed
                  ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-border shadow-xs hover:scale-110 z-20"
                  : ""
              }`}
              title={collapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto px-2.5 py-3 select-none no-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              {!collapsed && (
                <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block mt-1 first:mt-0 font-solaiman">
                  {group.groupLabel}
                </span>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ease-in-out cursor-pointer ${
                      active
                        ? "bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-foreground hover:bg-muted/70 font-semibold"
                    } ${collapsed ? "justify-center px-0 w-11 h-11 mx-auto" : ""}`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                      active ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    }`} />
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-sm tracking-tight truncate font-solaiman">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold leading-none ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 text-xs font-bold shadow-xl border border-slate-700/50 dark:border-slate-300/50 font-headline z-50"
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-2 p-3 border-t border-border/60 bg-muted/30">
          {/* Credit Balance Badge (Links to /credits) */}
          {!collapsed ? (
            <Link
              href="/credits"
              className="flex items-center justify-between rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 px-3 py-2 text-xs transition-colors cursor-pointer group shadow-2xs"
              title="ক্রেডিট প্ল্যান ও টপ-আপ দেখুন"
            >
              <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600">
                  <Coins className="h-3.5 w-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="font-solaiman">ক্রেডিট ব্যালেন্স</span>
              </div>
              <span
                className="font-extrabold text-amber-900 dark:text-amber-300 bg-card px-2 py-0.5 rounded-lg border border-amber-500/30 font-solaiman text-xs"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {creditData?.creditBalance ?? 0}
              </span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/credits"
                  className="flex justify-center"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-colors border border-amber-500/20 cursor-pointer">
                    <Coins className="h-4 w-4" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={12}
                className="rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 text-xs font-bold shadow-xl border border-slate-700/50 dark:border-slate-300/50 font-solaiman z-50"
              >
                <span>ক্রেডিট ব্যালেন্স: {creditData?.creditBalance ?? 0}</span>
              </TooltipContent>
            </Tooltip>
          )}

          {!collapsed && (
            <div className="flex items-center gap-2.5 px-1 py-1">
              <Avatar className="h-8 w-8 rounded-xl border border-border">
                <AvatarFallback className="text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-bold text-foreground truncate font-solaiman">
                  {user.name ?? "ইনস্টিটিউট অ্যাডমিন"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-mono">
                  {user.email ?? ""}
                </p>
              </div>
            </div>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex size-10 mx-auto items-center justify-center text-slate-600 dark:text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-150 ease-in-out cursor-pointer font-solaiman"
                >
                  <LogOut className="h-4.5 w-4.5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={12}
                className="rounded-xl bg-rose-600 text-white px-3 py-1.5 text-xs font-bold shadow-xl font-headline z-50"
              >
                <span>লগ আউট</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-xl py-2 px-3 transition-all duration-150 ease-in-out cursor-pointer font-solaiman"
              title="লগ আউট"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              <span className="text-sm font-semibold">লগ আউট</span>
            </button>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
};
