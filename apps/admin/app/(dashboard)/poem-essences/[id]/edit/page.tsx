import { use } from "react"
import { EditPoemEssencePage } from "@/modules/poem-essence/pages/edit-poem-essence-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const { id } = use(params)
  return <EditPoemEssencePage id={id} />
}
