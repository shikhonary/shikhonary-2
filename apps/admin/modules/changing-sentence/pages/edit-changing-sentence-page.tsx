import { Suspense } from "react"
import { EditChangingSentenceView } from "../components/edit-changing-sentence-view"

interface EditChangingSentencePageProps {
  params: Promise<{ id: string }>
}

export async function EditChangingSentencePage({ params }: EditChangingSentencePageProps) {
  const { id } = await params
  return (
    <Suspense>
      <EditChangingSentenceView id={id} />
    </Suspense>
  )
}
