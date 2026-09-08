import type { Metadata } from "next"
import { EditChangingSentencePage } from "@/modules/changing-sentence/pages/edit-changing-sentence-page"

export const metadata: Metadata = {
  title: "Edit Changing Sentence | Admin Dashboard",
  description: "Modify an existing Changing Sentence question",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  return <EditChangingSentencePage params={params} />
}
