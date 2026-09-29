import { EditEkKothayProkashPage } from "@/modules/ek-kothay-prokash/pages/edit-ek-kothay-prokash-page"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <EditEkKothayProkashPage id={id} />
}
