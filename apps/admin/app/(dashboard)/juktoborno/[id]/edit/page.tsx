import { EditJuktobornoPage } from "@/modules/juktoborno/pages/edit-juktoborno-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <EditJuktobornoPage id={id} />
}
