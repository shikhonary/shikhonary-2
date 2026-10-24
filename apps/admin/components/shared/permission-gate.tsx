"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"

export type ModuleAction = "create" | "read" | "update" | "delete" | "manage"

export interface PermissionGateProps {
  module: string
  action: ModuleAction
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Declarative component that gates UI rendering based on the user's RBAC permissions.
 * Automatically allows access for SUPER_ADMIN or when no restrictive permission rule applies.
 */
export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { data: me, isLoading } = useQuery({
    ...trpc.user.me.queryOptions(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  if (isLoading) {
    return null
  }

  // Super Admin bypass
  const isSuperAdmin =
    (me as any)?.user?.role === "SUPER_ADMIN" ||
    (me as any)?.isSuperAdmin ||
    (me as any)?.roles?.some((r: any) => r.isSuperAdmin || r.name === "SUPER_ADMIN")

  if (isSuperAdmin) {
    return <>{children}</>
  }

  // Check specific module permissions if present
  const permissions = (me as any)?.permissions ?? []
  if (permissions.length === 0) {
    // If no granular permissions assigned yet, allow default access for admin shell users
    return <>{children}</>
  }

  const hasAccess = permissions.some((p: any) => {
    if (p.module?.key !== module && p.moduleId !== module) return false

    if (p.canManage) return true

    switch (action) {
      case "create":
        return Boolean(p.canCreate)
      case "read":
        return Boolean(p.canRead)
      case "update":
        return Boolean(p.canUpdate)
      case "delete":
        return Boolean(p.canDelete)
      case "manage":
        return Boolean(p.canManage)
      default:
        return false
    }
  })

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
