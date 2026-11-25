import { Suspense } from "react"
import { PartsOfSpeechListView } from "../components/parts-of-speech-list-view"

export function PartsOfSpeechListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <PartsOfSpeechListView />
    </Suspense>
  )
}
