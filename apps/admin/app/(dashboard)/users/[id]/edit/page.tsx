import { EditUserPage } from "@/modules/user/pages/edit-user-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserRoute({ params }: PageProps) {
  const { id } = await params
  return <EditUserPage userId={id} />
}
