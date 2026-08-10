"use client"

import { EditTenantView as EditTenantComponent } from "../components/edit-tenant-view"

interface EditTenantViewProps {
  tenantId: string
}

export const EditTenantView = ({ tenantId }: EditTenantViewProps) => {
  return (
    <div className="min-h-screen bg-surface">
      <main className="container mx-auto max-w-4xl px-6 py-12 lg:px-12">
        <EditTenantComponent tenantId={tenantId} />
      </main>
    </div>
  )
}
