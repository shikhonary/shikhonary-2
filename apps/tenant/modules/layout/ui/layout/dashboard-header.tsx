"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@workspace/auth/client";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";
import {
  Menu,
  LayoutDashboard,
  CalendarDays,
  Hash,
  LogOut,
  GraduationCap,
  Settings,
  Coins,
  Plus,
  BookOpen,
  FileText,
  ScanLine,
  Globe,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@workspace/ui/components/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu";
import { useCreditBalance } from "@/modules/subscription-plan/services/use-subscription";
import { CreditRechargeModal } from "@/modules/subscription-plan/ui/components/credits/credit-recharge-modal";
import { toBengaliDigits } from "@/modules/subscription-plan/utils";

export function DashboardHeader() {
  const { user, membership, tenant } = useTenant();
  const pathname = usePathname();
  const router = useRouter();

  const [isRechargeModalOpen, setIsRechargeModalOpen] = React.useState(false);

  // Fetch live credit balance
  const { data: creditData, isLoading: isCreditLoading } = useCreditBalance();
  const creditBalance = creditData?.creditBalance ?? 0;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/sign-in");
  };

  const getFirstLetter = () => {
    if (user?.name) {
      return user.name.trim().charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    return pathname === url || pathname.startsWith(url + "/");
  };

  const navGroups = [
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

  const unionDisplayName = tenant.nameBn || tenant.name;

  return (
    <>
      <header className="w-full min-w-0 h-16 sticky top-0 bg-card border-b border-border flex justify-between items-center px-3 sm:px-6 z-40 shadow-xs">
        
        {/* Left Side: Mobile Drawer trigger */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <button
                id="mobile-navigation-trigger"
                type="button"
                className="md:hidden w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-colors cursor-pointer active:opacity-80"
                title="Open Navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col h-full bg-card border-r border-border">
              {/* Header / Brand */}
              <SheetHeader className="h-16 px-4 border-b border-border/60 flex flex-row items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-indigo-500/20 flex items-center justify-center bg-indigo-500/10 shadow-2xs">
                  {tenant.logo ? (
                    <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <SheetTitle className="font-headline text-sm font-bold text-foreground leading-tight truncate">
                    {unionDisplayName}
                  </SheetTitle>
                  <SheetDescription className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-none mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block animate-pulse"></span>
                    শিখনারী পোর্টাল
                  </SheetDescription>
                </div>
              </SheetHeader>

              {/* Navigation Lists */}
              <div className="flex-grow overflow-y-auto px-2.5 py-3 select-none flex flex-col gap-3.5 no-scrollbar">
                {navGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex flex-col gap-1">
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block font-solaiman">
                      {group.groupLabel}
                    </span>
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ease-in-out cursor-pointer ${
                              active
                                ? "bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30"
                                : "text-slate-600 dark:text-slate-300 hover:text-foreground hover:bg-muted/70 font-semibold"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                                active ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                              }`} />
                              <span className="text-sm tracking-tight truncate font-solaiman">
                                {item.label}
                              </span>
                            </div>
                            {item.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold leading-none ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Logout Footer */}
              <div className="mt-auto flex flex-col gap-2 p-3 border-t border-border/60 bg-muted/30">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-xl py-2 px-3 transition-all duration-150 ease-in-out cursor-pointer font-solaiman font-medium"
                >
                  <LogOut className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-sm font-semibold">লগ আউট</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right Side: Credit Balance + Recharge Button + User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Credit Wallet Badge with Recharge Action & Navigation to /credits */}
          <div className="flex items-center gap-1.5 p-1 pl-2.5 pr-1 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 shadow-2xs">
            <Link
              href="/credits"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              title="ক্রেডিট প্ল্যান ও ব্যালেন্স পর্যালোচনা করুন"
            >
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 fill-amber-500/20" />
              
              <div className="flex items-baseline gap-1">
                <span
                  className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-200 font-solaiman"
                  style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                >
                  {isCreditLoading ? "..." : toBengaliDigits(creditBalance)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800/80 dark:text-amber-300/80 hidden xs:inline">
                  ক্রেডিট
                </span>
              </div>
            </Link>

            <Link
              href="/credits"
              className="ml-1 px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
              title="ক্রেডিট রিচার্জ করুন"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>রিচার্জ</span>
            </Link>
          </div>

          {/* User dropdown menu trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="user-profile-dropdown-trigger"
                type="button"
                className="w-9 h-9 rounded-full overflow-hidden border border-border/80 cursor-pointer active:opacity-80 hover:ring-2 hover:ring-primary/20 transition-all shrink-0 flex items-center justify-center bg-card shadow-2xs"
                title={user?.name || "Shikhonary Profile"}
              >
                {user?.image ? (
                  <img
                    alt={user?.name || "Shikhonary Profile"}
                    className="w-full h-full object-cover"
                    src={user.image}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-xs uppercase select-none">
                    {getFirstLetter()}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 mt-1 rounded-2xl bg-card border border-border shadow-xl" align="end">
              <DropdownMenuLabel className="pb-1.5 pt-2">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-foreground truncate">{user?.name || "User"}</span>
                  <span className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">{user?.email}</span>
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-md uppercase w-max mt-1">
                    {membership.role === "ADMIN" ? "অ্যাডমিন" : membership.role}
                  </span>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/credits" className="flex items-center gap-2 w-full cursor-pointer">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span>ক্রেডিট প্ল্যান ও ওয়ালেট</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/subscription" className="flex items-center gap-2 w-full cursor-pointer">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>সাবস্ক্রিপশন প্ল্যান</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                  <Settings className="h-3.5 w-3.5" />
                  <span>প্রতিষ্ঠান প্রোফাইল ও সেটিংস</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>লগ আউট</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Credit Recharge Modal */}
      <CreditRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        currentBalance={creditBalance}
      />
    </>
  );
}

export default DashboardHeader;
