"use client"

import { Suspense } from "react"
import { ContentTrackerView } from "../components/content-tracker-view"

export function ContentTrackerPage() {
  return (
    <Suspense>
      <ContentTrackerView />
    </Suspense>
  )
}
