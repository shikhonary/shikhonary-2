"use client"

import { EditShuddhoAshuddhoView } from "../components/edit-shuddho-ashuddho-view"

interface EditShuddhoAshuddhoPageProps {
  id: string
}

export function EditShuddhoAshuddhoPage({ id }: EditShuddhoAshuddhoPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditShuddhoAshuddhoView id={id} />
    </div>
  )
}
