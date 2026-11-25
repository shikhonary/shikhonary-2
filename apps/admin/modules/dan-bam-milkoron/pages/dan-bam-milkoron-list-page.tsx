"use client"

import { Suspense } from "react"
import { DanBamMilkoronListView } from "../components/dan-bam-milkoron-list-view"

export function DanBamMilkoronListPage() {
  return (
    <Suspense>
      <DanBamMilkoronListView />
    </Suspense>
  )
}
