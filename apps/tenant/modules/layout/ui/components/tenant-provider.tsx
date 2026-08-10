"use client";

import React, { createContext, useContext } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TenantInfo {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  logo: string | null;
  upazilaName?: string | null;
  districtName?: string | null;
  divisionName?: string | null;
  unionName?: string | null;
  chairmanName?: string | null;
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
