import { EditCqPage } from "@/modules/cq/pages/edit-cq-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCqRoute({ params }: PageProps) {
  const { id } = await params
  return <EditCqPage id={id} />
}
