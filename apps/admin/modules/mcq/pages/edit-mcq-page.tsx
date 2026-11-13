"use client"

import { Suspense } from "react"
import { EditMcqView } from "../components/edit-mcq-view"

interface EditMcqPageProps {
  id: string
}

export function EditMcqPage({ id }: EditMcqPageProps) {
  return (
    <Suspense>
      <EditMcqView id={id} />
    </Suspense>
  )
}
