import { Suspense } from "react"
import { EditPoemEssenceView } from "../components/edit-poem-essence-view"

interface EditPoemEssencePageProps {
  id: string
}

export function EditPoemEssencePage({ id }: EditPoemEssencePageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditPoemEssenceView id={id} />
    </Suspense>
  )
}
