"use client"

import { Suspense } from "react"
import { EkKothayProkashListView } from "../components/ek-kothay-prokash-list-view"

export function EkKothayProkashListPage() {
  return (
    <Suspense>
      <EkKothayProkashListView />
    </Suspense>
  )
}
