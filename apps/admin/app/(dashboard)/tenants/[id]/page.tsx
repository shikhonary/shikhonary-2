import { TenantView } from "@/modules/tenant/ui/views/tenant-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params
  return <TenantView tenantId={id} />
}
