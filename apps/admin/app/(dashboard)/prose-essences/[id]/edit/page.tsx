import { use } from "react"
import { EditProseEssencePage } from "@/modules/prose-essence/pages/edit-prose-essence-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const { id } = use(params)
  return <EditProseEssencePage id={id} />
}
