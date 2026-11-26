import { Suspense } from "react"
import { EditPunctuationView } from "../components/edit-punctuation-view"

export function EditPunctuationPage({ id }: { id?: string } = {}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditPunctuationView id={id} />
    </Suspense>
  )
}
