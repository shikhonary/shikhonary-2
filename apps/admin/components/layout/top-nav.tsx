"use client"

import { authClient } from "@workspace/auth/client"

export function TopNav() {
  const { data: session } = authClient.useSession()

  const defaultAvatar =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCdx-9r8l3Kjary3W-CX4s3KA9ZVUToc8px9mA4iQKYyOMJc--_uhARjvqeqCnV4gj2s3a_-P4D9LI4LUOh4eFkyHicXJmrUC3l5xIXSwZNG_Edf3QVyQI0pJvf_JhKEVKGSRaE01S8pyoD4Ce5_g3v-ZwLCZZtc36pL_oQnyjIJrHeoCGRdM5hAlB7EGrRao8FLvNNTF8QuVz0TXP2YBMD__KNvLAPrkWl40z-qOm1UfSTSx7hMot5jPikXeXy-xHx9yJkTuRD2b0"

  return (
    <header className="w-full h-14 sticky top-0 bg-surface dark:bg-surface-container border-b border-outline-variant flex justify-between items-center px-4 sm:px-6 z-40">
      {/* Left Side */}
      <div></div>

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

        <div
          className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant ml-2 cursor-pointer active:opacity-80"
          title={session?.user?.name || "Dr. User Profile"}
        >
          <img
            alt={session?.user?.name || "Dr. User Profile"}
            className="w-full h-full object-cover"
            src={session?.user?.image || defaultAvatar}
          />
        </div>
      </div>
    </header>
  )
}
