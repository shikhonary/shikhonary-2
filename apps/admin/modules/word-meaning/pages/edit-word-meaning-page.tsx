"use client"

import { EditWordMeaningView } from "../components/edit-word-meaning-view"

interface EditWordMeaningPageProps {
  id: string
}

export function EditWordMeaningPage({ id }: EditWordMeaningPageProps) {
  return <EditWordMeaningView id={id} />
}
