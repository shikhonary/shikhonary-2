import { Suspense } from "react"
import { NumberInWordsListView } from "../components/number-in-words-list-view"

export function NumberInWordsListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <NumberInWordsListView />
    </Suspense>
  )
}
