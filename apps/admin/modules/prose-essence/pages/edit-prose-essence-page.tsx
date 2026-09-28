"use client"

import { EditProseEssenceView } from "../components/edit-prose-essence-view"

interface EditProseEssencePageProps {
  id: string
}

export function EditProseEssencePage({ id }: EditProseEssencePageProps) {
  return <EditProseEssenceView id={id} />
}
