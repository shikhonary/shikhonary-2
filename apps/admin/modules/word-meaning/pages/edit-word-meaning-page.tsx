"use client"

import { EditWordMeaningView } from "../components/edit-word-meaning-view"

interface EditWordMeaningPageProps {
  id: string
}

export function EditWordMeaningPage({ id }: EditWordMeaningPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditWordMeaningView id={id} />
    </div>
  )
}
