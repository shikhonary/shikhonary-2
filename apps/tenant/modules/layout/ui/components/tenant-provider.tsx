"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TenantInfo {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  logo: string | null;
  // Geographic IDs
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
  unionId?: string | null;
  // Geographic Names (English)
  upazilaName?: string | null;
  districtName?: string | null;
  divisionName?: string | null;
  unionName?: string | null;
  // Geographic Names (Bengali)
  divisionNameBn?: string | null;
  districtNameBn?: string | null;
  upazilaNameBn?: string | null;
  unionNameBn?: string | null;
  principalName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface MembershipInfo {
  id: string;
  role: string;
  joinedAt: Date;
}

interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface TenantContextValue {
  tenant: TenantInfo;
  membership: MembershipInfo;
  user: UserInfo;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TenantContext = createContext<TenantContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface TenantProviderProps {
  tenant: TenantInfo;
  membership: MembershipInfo;
  user: UserInfo;
  children: React.ReactNode;
}

export function TenantProvider({
  tenant,
  membership,
  user,
  children,
}: TenantProviderProps) {
  const pathname = usePathname();

  // Dynamic Browser Tab Branding: Ensures the institution name is displayed alongside page title
  useEffect(() => {
    if (typeof document === "undefined") return;
    const institutionName = tenant.nameBn || tenant.name;
    if (!institutionName) return;

    // Small delay to allow Next.js route metadata to set initial document.title
    const timer = setTimeout(() => {
      const currentTitle = document.title;
      if (currentTitle && !currentTitle.includes(institutionName)) {
        if (currentTitle.includes("| শিখনারী পোর্টাল")) {
          document.title = currentTitle
            .replace("| শিখনারী পোর্টাল", `| ${institutionName} - শিখনারী`);
        } else if (currentTitle.includes("| শিখনারী")) {
          document.title = currentTitle
            .replace("| শিখনারী", `| ${institutionName} - শিখনারী`);
        } else if (currentTitle === "শিখনারী পোর্টাল" || currentTitle === "শিখনারী") {
          document.title = `${institutionName} - শিখনারী পোর্টাল`;
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, tenant.nameBn, tenant.name]);

  return (
    <TenantContext.Provider value={{ tenant, membership, user }}>
      {children}
    </TenantContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the resolved tenant, membership, and user from the TenantProvider.
 * Must be used inside the `(root)` layout where TenantProvider is mounted.
 */
export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}
