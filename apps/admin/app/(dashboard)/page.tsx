"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { authClient } from "@workspace/auth/client"
import { useCurrentUser } from "@/modules/user/services/use-user"

export default function DashboardPage() {
  const router = useRouter()
  const { session, roles } = useCurrentUser()
  const { data: pingData } = useQuery(trpc.health.ping.queryOptions())

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <div className="w-full flex flex-col gap-lg">
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-md">
        Dashboard Overview
      </h2>

      {/* Primary Dashboard Grid Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Main State Canvas */}
        <div className="lg:col-span-2 w-full min-h-[380px] border border-outline-variant border-dashed rounded-xl flex items-center justify-center bg-surface-container-lowest p-lg shadow-sm">
          <div className="text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-sm block">
              insights
            </span>
            <p className="font-body-lg text-body-lg text-on-surface-variant font-medium max-w-md">
              Select a module from the left menu or view real-time system performance metrics.
            </p>
          </div>
        </div>

        {/* Live System Integration Card */}
        <div className="flex flex-col gap-md bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-primary text-2xl">
              admin_panel_settings
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                BEC Portal
              </h3>
              <p className="font-caption text-caption text-on-surface-variant">
                Admin Workstation
              </p>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 my-xs"></div>

          {/* User Profile Info */}
          {session && (
            <div className="flex flex-col gap-xs text-body-md">
              <span className="font-caption text-caption uppercase text-on-surface-variant font-semibold">
                Active User
              </span>
              <span className="font-label-md text-label-md text-on-surface font-bold">
                {session.user.name}
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                {session.user.email}
              </span>
              <span className="font-caption text-caption text-primary font-medium mt-1">
                Roles: {roles.map((r) => r.name).join(", ")}
              </span>
            </div>
          )}

          <div className="border-t border-outline-variant/30 my-xs"></div>

          {/* API Health Status */}
          <div className="flex flex-col gap-xs">
            <span className="font-caption text-caption uppercase text-on-surface-variant font-semibold">
              System Integration Status
            </span>
            <div className="flex items-center gap-sm mt-1">
              <div
                className={`w-3 h-3 rounded-full ${
                  pingData ? "bg-green-500" : "bg-amber-500 animate-pulse"
                }`}
              ></div>
              <span className="font-label-md text-label-md text-on-surface">
                {pingData
                  ? `Connected to Backend API (${pingData})`
                  : "Checking backend connectivity..."}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-md">
            <button
              onClick={handleSignOut}
              className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-2 rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 shadow-sm border border-transparent flex items-center justify-center gap-sm cursor-pointer"
            >
              <span>Sign Out</span>
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
