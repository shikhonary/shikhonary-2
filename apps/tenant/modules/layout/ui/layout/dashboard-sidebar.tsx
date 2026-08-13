"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Calculator, ChevronDown } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  FileText,
  CalendarDays,
  Calendar,
  BarChart3,
  Bell,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  ClipboardList,
  TrendingUp,
  BookOpen,
  FileSpreadsheet,
  FileEdit,
  Shield,
  Briefcase,
  DollarSign,
  CreditCard,
  SendHorizonal,
  BookCopy,
  Bus,
  Activity,
  Lock,
  Hash,
  Building2,
  MapPin,
  UserPlus,
  Bot,
  Coins,
  ScanLine,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { cn } from "@workspace/ui/lib/utils";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { authClient } from "@workspace/auth/client";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { title: string; url: string; icon?: React.ComponentType<{ className?: string }> }[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "প্রধান মেনু",
    items: [
      { title: "ড্যাশবোর্ড", url: "/", icon: LayoutDashboard },
      { title: "অর্থবছর", url: "/fiscal-years", icon: CalendarDays },
      { title: "ওয়ার্ড", url: "/wards", icon: MapPin },
      { title: "কাউন্টার", url: "/counters", icon: Hash },
    ],
  },
  {
    label: "কর ব্যবস্থাপনা",
    items: [
      { title: "করদাতা", url: "/tax-payers", icon: Users },
      { title: "কর আদায়", url: "/tax-collection", icon: Coins },
      { title: "কর জেনারেট", url: "/generate-tax-payment", icon: Calculator },
    ],
  },
  {
    label: "নাগরিক সেবা",
    items: [
      { title: "নাগরিক তালিকা", url: "/citizens", icon: Users },
      { title: "নাগরিক আবেদন", url: "/citizen-applications", icon: ClipboardList },
    ],
  },
];


interface SidebarContentProps {
  collapsed: boolean;
  onToggle?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  collapsed,
  onToggle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant, user } = useTenant();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/auth/sign-in");
  };

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    if (url === "/settings") {
      return pathname === "/settings";
    }
    return pathname === url || pathname.startsWith(url + "/");
  };

  return (
    <div className="flex flex-col h-full bg-card border-none shadow-xl shadow-black/40 z-30 relative">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 pb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 bg-primary shadow-md shadow-black/40">
            <BookOpen className="w-5 h-5 text-[#001a0f]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-foreground">
                {tenant.nameBn ?? tenant.name}
              </span>
              <span className="text-xs text-muted-foreground -mt-0.5 font-bold">
                ইউনিয়ন পরিষদ পোর্টাল
              </span>
            </div>
          )}
        </Link>
        {onToggle && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-black text-muted-foreground dark:text-[#4a607d] uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isSectionActive = isActive(item.url);

                  if (hasSubItems && !collapsed) {
                    return (
                      <Accordion
                        key={item.title}
                        type="single"
                        collapsible
                        defaultValue={isSectionActive ? item.title : undefined}
                      >
                        <AccordionItem value={item.title} className="border-none">
                          <AccordionTrigger
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:no-underline",
                              isSectionActive
                                ? "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.02]",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                              <span>{item.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-1 pt-1 ml-4 border-l border-border/50">
                            <div className="pl-4 space-y-1 mt-1">
                              {item.subItems?.map((subItem) => (
                                <Link
                                  key={subItem.title}
                                  href={subItem.url}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200",
                                      pathname === subItem.url
                                        ? "text-primary bg-primary/10 dark:text-primary dark:bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.02]",
                                  )}
                                >
                                  {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                                  <span>{subItem.title}</span>
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  }

                  const linkContent = (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground dark:bg-primary/10 dark:text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.02]",
                        collapsed && "justify-center",
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-bold text-xs">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkContent;
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-3 pt-6 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                ইউপি
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground truncate">
                {user.name ?? "ইউপি অ্যাডমিন"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-bold">
                {user.email ?? ""}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>লগ আউট</span>}
        </button>
      </div>
    </div>
  );
};

export const MobileSidebarTrigger: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9 text-foreground/80 hover:bg-muted/50 cursor-pointer lg:hidden"
          title="মেনু খুলুন"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 border-none dark:bg-[#0d1422] dark:border-r dark:border-[rgba(0,229,160,0.08)]">
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
};

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  onToggle,
}) => {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-card dark:bg-[#111b2e] border border-border dark:border-[rgba(0,229,160,0.15)] shadow-sm z-40 dark:[box-shadow:0_0_8px_rgba(0,229,160,0.2)]"
        >
          <ChevronLeft className="w-3 h-3 rotate-180" />
        </Button>
      )}
    </aside>
  );
};
