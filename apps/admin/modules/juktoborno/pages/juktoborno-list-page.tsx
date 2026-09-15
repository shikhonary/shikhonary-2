"use client"

import { Suspense } from "react"
import { JuktobornoListView } from "../components/juktoborno-list-view"

export function JuktobornoListPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm font-bold text-primary animate-pulse">
          Loading Juktoborno Bank...
        </div>
      }
    >
      <JuktobornoListView />
    </Suspense>
  )
}
