"use client"

import { Suspense } from "react"
import { CqListView } from "../components/cq-list-view"

export function CqListPage() {
  return (
    <Suspense>
      <CqListView />
    </Suspense>
  )
}
