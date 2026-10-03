"use client"

import { EditDanBamMilkoronView } from "../components/edit-dan-bam-milkoron-view"

interface EditDanBamMilkoronPageProps {
  id: string
}

export function EditDanBamMilkoronPage({ id }: EditDanBamMilkoronPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditDanBamMilkoronView id={id} />
    </div>
  )
}
