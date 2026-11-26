import { Suspense } from "react"
import { PunctuationListView } from "../components/punctuation-list-view"

export function PunctuationListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <PunctuationListView />
    </Suspense>
  )
}
