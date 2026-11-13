"use client"

import { Suspense } from "react"
import { McqListView } from "../components/mcq-list-view"

export function McqListPage() {
  return (
    <Suspense>
      <McqListView />
    </Suspense>
  )
}
