"use client"

import { EditTenantView } from "../components/edit-tenant-view"

interface EditTenantFormProps {
  tenantId: string
}

export function EditTenantForm({ tenantId }: EditTenantFormProps) {
  return <EditTenantView tenantId={tenantId} />
}
