"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  Calculator,
  MapPin,
  CalendarDays,
  Settings,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const mobileNavItems = [
  {
    title: "ড্যাশবোর্ড",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "করদাতা",
    url: "/tax-payers",
    icon: Users,
  },
  {
    title: "কর আদায়",
    url: "/tax-collection",
    icon: Coins,
  },
  {
    title: "কর জেনারেট",
    url: "/generate-tax-payment",
    icon: Calculator,
  },
  {
    title: "প্রোফাইল",
    url: "/profile",
    icon: Settings,
  },
];

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    return pathname === url || pathname.startsWith(url + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/90 backdrop-blur-xl border-t border-border/60 shadow-2xl px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const active = isActive(item.url);
          const Icon = item.icon;

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 relative min-w-[56px] group",
                active
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              {/* Active Background Glow Pill */}
              {active && (
                <span className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 shadow-xs animate-in fade-in zoom-in-95 duration-150" />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-active:scale-95",
                    active && "scale-110 text-primary drop-shadow-[0_0_8px_rgba(0,229,160,0.4)]"
                  )}
                />
                <span className="text-[10px] tracking-tight truncate max-w-[64px] font-body">
                  {item.title}
                </span>
              </div>

              {/* Active Dot */}
              {active && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_rgba(0,229,160,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
