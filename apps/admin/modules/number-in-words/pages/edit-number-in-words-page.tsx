import { Suspense } from "react"
import { EditNumberInWordsView } from "../components/edit-number-in-words-view"

interface EditNumberInWordsPageProps {
  id: string
}

export function EditNumberInWordsPage({ id }: EditNumberInWordsPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditNumberInWordsView id={id} />
    </Suspense>
  )
}
