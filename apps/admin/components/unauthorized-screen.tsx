"use client"

import { Button } from "@workspace/ui/components/button"

interface UnauthorizedScreenProps {
  email?: string
  roles?: string[]
  onSignOut: () => void | Promise<void>
}

export function UnauthorizedScreen({
  email,
  roles,
  onSignOut,
}: UnauthorizedScreenProps) {
  return (
    <div className="flex min-h-svh flex-col bg-surface font-body-md text-on-surface selection:bg-primary-fixed-dim">
      {/* Main Error Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12">
        <div className="flex w-full max-w-2xl flex-col items-center space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Visual Anchor: Security Icon */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto h-32 w-32 rounded-full bg-primary-container/10 animate-ping opacity-25"></div>
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-high shadow-sm">
              <span
                className="material-symbols-outlined text-primary text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_lock
              </span>
            </div>
          </div>

          {/* Content Block */}
          <div className="space-y-4">
            <h1 className="font-headline-md text-3xl font-extrabold text-on-surface md:text-4xl">
              Access Denied
            </h1>
            <p className="mx-auto max-w-lg font-body-lg text-body-lg text-on-surface-variant">
              You do not have the required permissions to view the Super Admin dashboard. Please contact the system administrator if you believe this is an error.
            </p>
          </div>

          {/* User & Role Details */}
          {(email || (roles && roles.length > 0)) && (
            <div className="flex max-w-md w-full flex-col gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 text-xs">
              {email && (
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Account:</span>
                  <span className="font-semibold text-on-surface">{email}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Assigned Roles:</span>
                <span className="font-semibold text-on-surface">
                  {roles && roles.length > 0 ? roles.join(", ") : "None"}
                </span>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="flex w-full flex-col items-center justify-center gap-4 pt-2 md:flex-row">
            <Button
              onClick={onSignOut}
              className="h-12 w-full md:w-auto px-8 bg-primary-container text-on-primary font-medium text-body-md rounded-lg shadow-md hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign Out</span>
            </Button>

            <a
              href="mailto:support@shikhonary.com"
              className="h-12 w-full md:w-auto px-8 border border-outline text-primary font-medium text-body-md rounded-lg hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <span>Contact Support</span>
            </a>
          </div>

          {/* Error Detail Chip */}
          <div className="pt-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 font-label-sm text-label-sm text-outline">
              <span className="material-symbols-outlined text-[14px]">error</span>
              ERROR CODE: 403_FORBIDDEN_RESTRICTED_AUTH
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
