import { Suspense } from "react"
import { EditProseEssenceView } from "../components/edit-prose-essence-view"

interface EditProseEssencePageProps {
  id: string
}

export function EditProseEssencePage({ id }: EditProseEssencePageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditProseEssenceView id={id} />
    </Suspense>
  )
}
