"use client"

import { Suspense } from "react"
import { EditCqView } from "../components/edit-cq-view"

export function EditCqPage() {
  return (
    <Suspense>
      <EditCqView />
    </Suspense>
  )
}
