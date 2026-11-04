"use client"

import { EditTenantView as EditTenantComponent } from "../components/edit-tenant-view"

interface EditTenantViewProps {
  tenantId: string
}

export const EditTenantView = ({ tenantId }: EditTenantViewProps) => {
  return (
    <div className="w-full">
      <EditTenantComponent tenantId={tenantId} />
    </div>
  )
}
