"use client";

import React from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { authClient } from "@workspace/auth/client";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";
import { MobileSidebarTrigger } from "./dashboard-sidebar";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  const router = useRouter();
  const { user, membership, tenant } = useTenant();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/auth/sign-in");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const roleLabel =
    membership.role === "ADMIN" ? "অ্যাডমিন" : membership.role;

  const unionDisplayName = tenant.nameBn || tenant.unionName || tenant.name;

  return (
    <header className="sticky top-0 z-30 w-full bg-background/85 backdrop-blur-xl border-b border-border/50 shadow-xs">
      <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-14 sm:h-16 gap-2 sm:gap-4">
        {/* Left: Mobile Sidebar Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="lg:hidden shrink-0">
            <MobileSidebarTrigger />
          </div>
        </div>

        {/* Center: Tenant Union Name & Chairman Name */}
        <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-1">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-center max-w-full">
            {tenant.logo && (
              <img
                src={tenant.logo}
                alt={unionDisplayName}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-primary/20 shrink-0 hidden xs:block"
              />
            )}
            <h2 className="font-display text-xs xs:text-sm sm:text-base font-black text-foreground tracking-tight bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
              {unionDisplayName}
            </h2>
          </div>
          {tenant.chairmanName && (
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground font-body truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
              অধ্যক্ষ: <span className="font-semibold text-foreground/90">{tenant.chairmanName}</span>
            </p>
          )}
        </div>

        {/* Right: User Dropdown Menu */}
        <div className="flex items-center justify-end flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 p-1 pr-2.5 rounded-xl hover:bg-muted/50 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer"
              >
                <Avatar className="h-8 w-8 border border-border/40 rounded-lg overflow-hidden shadow-xs shrink-0">
                  <AvatarImage
                    src={user.image || "/placeholder.svg"}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start leading-none gap-1 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                    {user.name || "ব্যবহারকারী"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {roleLabel}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-2 rounded-2xl border-border/50 shadow-xl backdrop-blur-xl bg-popover text-popover-foreground"
            >
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-foreground truncate">
                    {user.name || "ব্যবহারকারী"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {user.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40" />
              <div className="p-1 space-y-1">
                <Link href="/profile" className="block w-full">
                  <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                    প্রোফাইল দেখুন
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile" className="block w-full">
                  <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                    ইউনিয়ন সেটিংস
                  </DropdownMenuItem>
                </Link>
              </div>
              <DropdownMenuSeparator className="bg-border/40" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  লগ আউট
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
