"use client"

import { EditNumberInWordsView } from "../components/edit-number-in-words-view"

interface EditNumberInWordsPageProps {
  id: string
}

export function EditNumberInWordsPage({ id }: EditNumberInWordsPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditNumberInWordsView id={id} />
    </div>
  )
}
