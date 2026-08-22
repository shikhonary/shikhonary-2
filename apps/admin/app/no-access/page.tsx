"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@workspace/auth/client"

export default function NoAccessPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans text-foreground">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 md:p-10 border border-border shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-card-foreground text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto text-primary">
          <span className="text-4xl">🔒</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Super Admin Access Required
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Your account does not have Super Admin permissions to access the Shikhonary workstation portal.
            Please contact your system administrator if you believe this is an error.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold tracking-wider uppercase hover:bg-primary/90 shadow-[0_6px_20px_rgba(67,56,202,0.25)] active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            Log In with a Different Account
          </button>
        </div>
      </div>
    </div>
  )
}
