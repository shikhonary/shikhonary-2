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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { authClient } from "@workspace/auth/client";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
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
      groupLabel: "Main",
      items: [
        { href: "/", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
        { href: "/question-papers", label: "প্রশ্নপত্র", icon: FileText },
      ],
    },
  ];

  return (
    <nav
      className={`h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant hidden md:flex flex-col py-4 z-50 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 mb-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/40 flex items-center justify-center bg-primary/10">
            {tenant.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-6 h-6 text-primary" />
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-headline-sm text-sm font-extrabold text-primary leading-tight truncate">
                {tenant.nameBn || tenant.name}
              </h1>
              <p className="font-caption text-on-surface-variant text-[10px]">
                শিখনারী পোর্টাল
              </p>
            </div>
          )}
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer shrink-0"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-2 py-3 select-none">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            {!collapsed && (
              <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-outline block mt-2 first:mt-0">
                {group.groupLabel}
              </span>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ease-in-out border-l-4 ${
                    active
                      ? "bg-surface-container-high text-primary rounded-r-lg font-bold border-primary"
                      : "text-on-surface-variant hover:bg-surface-variant border-transparent"
                  } ${collapsed ? "justify-center border-l-0 rounded-lg" : ""}`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3 p-4 border-t border-outline-variant/30 bg-muted/20">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                {user.name ? user.name.charAt(0).toUpperCase() : "E"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-black text-foreground truncate">
                {user.name ?? "ইনস্টিটিউট অ্যাডমিন"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-bold">
                {user.email ?? ""}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant rounded-lg py-2 px-3 transition-all duration-200 ease-in-out cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">লগ আউট</span>}
        </button>
      </div>
    </nav>
  );
};
