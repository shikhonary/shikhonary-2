"use client"

import { CreateTenantView } from "../components/create-tenant-view"

export const NewTenantView = () => {
  return (
    <div className="min-h-screen bg-surface">
      <main className="container mx-auto max-w-4xl px-6 py-12 lg:px-12">
        <CreateTenantView />
      </main>
    </div>
  )
}
