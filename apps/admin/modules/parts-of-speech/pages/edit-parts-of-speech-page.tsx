import { Suspense } from "react"
import { EditPartsOfSpeechView } from "../components/edit-parts-of-speech-view"

export function EditPartsOfSpeechPage({ id }: { id?: string } = {}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditPartsOfSpeechView id={id} />
    </Suspense>
  )
}
