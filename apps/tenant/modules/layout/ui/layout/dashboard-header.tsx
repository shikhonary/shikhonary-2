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

export function DashboardHeader() {
  const { user, membership, tenant } = useTenant();
  const pathname = usePathname();
  const router = useRouter();

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
      groupLabel: "Main",
      items: [
        { href: "/", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
      ],
    },
  ];

  const unionDisplayName = tenant.nameBn || tenant.name;

  return (
    <header className="w-full h-14 sticky top-0 bg-surface border-b border-outline-variant flex justify-between items-center px-4 sm:px-6 z-40">
      
      {/* Left Side: Mobile Drawer trigger */}
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button
              id="mobile-navigation-trigger"
              type="button"
              className="md:hidden w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors cursor-pointer active:opacity-80"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col h-full bg-surface">
            {/* Header / Brand */}
            <SheetHeader className="p-4 border-b border-outline-variant flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/40 flex items-center justify-center bg-primary/10">
                {tenant.logo ? (
                  <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-left">
                <SheetTitle className="font-heading text-sm font-extrabold text-primary leading-tight">
                  {unionDisplayName}
                </SheetTitle>
                <SheetDescription className="text-[10px] text-on-surface-variant leading-none mt-0.5">
                  শিখনারী পোর্টাল
                </SheetDescription>
              </div>
            </SheetHeader>

            {/* Navigation Lists */}
            <div className="flex-grow overflow-y-auto px-2 py-4 select-none flex flex-col gap-4">
              {navGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="flex flex-col gap-1">
                  <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-outline block">
                    {group.groupLabel}
                  </span>
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ease-in-out border-l-4 ${
                            active
                              ? "bg-surface-container-high text-primary rounded-r-lg font-bold border-primary"
                              : "text-on-surface-variant hover:bg-surface-variant border-transparent"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.label}
                          </span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Logout Footer */}
            <div className="mt-auto flex flex-col gap-3 p-4 border-t border-outline-variant/30 bg-muted/20">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant rounded-lg py-2 px-3 transition-all duration-200 ease-in-out cursor-pointer"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">লগ আউট</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop display of Tenant Name on the left (TopNav) */}
        <div className="hidden md:flex items-center gap-2">
          {tenant.logo && (
            <img
              src={tenant.logo}
              alt={unionDisplayName}
              className="w-6 h-6 rounded-full object-cover border border-primary/20 shrink-0"
            />
          )}
          <span className="font-bold text-sm text-foreground">
            {unionDisplayName}
          </span>
        </div>
      </div>

      {/* Center display (for mobile only/optional spacer) */}
      <div className="md:hidden flex items-center gap-2">
        <span className="font-bold text-xs text-foreground truncate max-w-[150px]">
          {unionDisplayName}
        </span>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-1 border border-outline-variant focus-within:border-secondary transition-colors h-9 w-64 hidden md:flex">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 outline-none w-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
            placeholder="Search..."
            type="text"
          />
        </div>

        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer active:opacity-80"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer active:opacity-80"
          title="Help"
        >
          <span className="material-symbols-outlined text-xl">help</span>
        </button>

        {/* User dropdown menu trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="user-profile-dropdown-trigger"
              type="button"
              className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant ml-2 cursor-pointer active:opacity-80 hover:ring-2 hover:ring-primary/20 transition-all shrink-0 flex items-center justify-center"
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
          
          <DropdownMenuContent className="w-56 mt-1 rounded-xl bg-card border border-border" align="end">
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
              <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                <Settings className="h-3.5 w-3.5" />
                <span>প্রতিষ্ঠান সেটিংস</span>
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
  );
}

export default DashboardHeader;
