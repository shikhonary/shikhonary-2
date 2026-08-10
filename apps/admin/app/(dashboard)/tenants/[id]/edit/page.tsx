import { EditTenantView } from "@/modules/tenant/ui/views/edit-tenant-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTenantPage({ params }: PageProps) {
  const { id } = await params
  return <EditTenantView tenantId={id} />
}
