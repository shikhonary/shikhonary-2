import { EditMakeQuestionPage } from "@/modules/make-question/pages/edit-make-question-page"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMakeQuestionRoute({ params }: PageProps) {
  const { id } = await params
  return <EditMakeQuestionPage id={id} />
}
