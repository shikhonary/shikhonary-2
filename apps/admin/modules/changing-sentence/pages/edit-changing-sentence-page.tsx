import { EditChangingSentenceView } from "../components/edit-changing-sentence-view"

interface EditChangingSentencePageProps {
  params: Promise<{ id: string }>
}

export async function EditChangingSentencePage({ params }: EditChangingSentencePageProps) {
  const { id } = await params
  return <EditChangingSentenceView id={id} />
}
