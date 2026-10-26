"use client"

import * as React from "react"
import Link from "next/link"
import { LucideIcon, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { PermissionGate, type ModuleAction } from "./permission-gate"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderBadge {
  label: string
  icon?: LucideIcon
  variant?: "emerald" | "blue" | "amber" | "rose" | "indigo" | "default"
  className?: string
}

export interface PageHeaderAction {
  label: string
  href?: string
  onClick?: () => void
  icon?: LucideIcon
  className?: string
  permission?: {
    module: string
    action: ModuleAction
  }
}

export interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconBg?: string
  iconColor?: string
  badge?: React.ReactNode | PageHeaderBadge
  breadcrumbs?: BreadcrumbItem[]
  action?: PageHeaderAction
  children?: React.ReactNode
  className?: string
}

const BADGE_VARIANTS: Record<string, string> = {
  emerald:
    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
  blue:
    "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
  amber:
    "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
  rose:
    "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
  indigo:
    "bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary border-indigo-200/60 dark:border-primary/20",
  default:
    "bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border-indigo-200/60",
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  breadcrumbs,
  action,
  children,
  className,
}: PageHeaderProps) {
  // Render badge whether string, custom badge object, or ReactNode
  const renderBadge = () => {
    if (!badge) return null

    if (React.isValidElement(badge)) {
      return badge
    }

    if (typeof badge === "object" && "label" in badge) {
      const BadgeIcon = badge.icon
      const variantClass = BADGE_VARIANTS[badge.variant || "emerald"]

      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 font-body",
            variantClass,
            badge.className
          )}
        >
          {BadgeIcon && <BadgeIcon className="w-3 h-3 shrink-0" />}
          <span>{badge.label}</span>
        </span>
      )
    }

    return null
  }

  // Render primary action button matching Tenant App design system
  const renderAction = () => {
    if (!action) return null

    const ActionIcon = action.icon || Plus

    const buttonContent = (
      <>
        <ActionIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90 shrink-0" />
        <span>{action.label}</span>
      </>
    )

    const buttonElement = action.href ? (
      <Button
        asChild
        className={cn(
          "group relative h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 font-headline",
          action.className
        )}
      >
        <Link href={action.href} prefetch={true}>
          {buttonContent}
        </Link>
      </Button>
    ) : (
      <Button
        onClick={action.onClick}
        className={cn(
          "group relative h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 font-headline",
          action.className
        )}
      >
        {buttonContent}
      </Button>
    )

    if (action.permission) {
      return (
        <PermissionGate
          module={action.permission.module}
          action={action.permission.action}
        >
          {buttonElement}
        </PermissionGate>
      )
    }

    return buttonElement
  }

  return (
    <header
      className={cn(
        "w-full min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08] mb-6",
        className
      )}
    >
      {/* Brand Icon, Title & Active Badge */}
      <div className="flex items-center gap-3.5 min-w-0 max-w-full">
        {Icon && (
          <div
            className={cn(
              "shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shadow-xs",
              iconBg || "bg-indigo-50 dark:bg-primary/10 border-indigo-100/80 dark:border-primary/20",
              iconColor || "text-indigo-600 dark:text-primary"
            )}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </div>
        )}

        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-body">
              {breadcrumbs.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>/</span>}
                  {item.href ? (
                    <Link
                      href={item.href}
                      prefetch={true}
                      className="hover:text-indigo-600 dark:hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-foreground leading-none">
              {title}
            </h1>
            {renderBadge()}
          </div>

          {description && (
            <p className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground font-body line-clamp-1 max-w-2xl leading-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Primary Action Button Slot & Custom Children */}
      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {renderAction()}
          {children}
        </div>
      )}
    </header>
  )
}
