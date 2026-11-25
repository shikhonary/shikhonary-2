"use client"

import { Suspense } from "react"
import { EditDanBamMilkoronView } from "../components/edit-dan-bam-milkoron-view"

interface EditDanBamMilkoronPageProps {
  id: string
}

export function EditDanBamMilkoronPage({ id }: EditDanBamMilkoronPageProps) {
  return (
    <Suspense>
      <EditDanBamMilkoronView id={id} />
    </Suspense>
  )
}
