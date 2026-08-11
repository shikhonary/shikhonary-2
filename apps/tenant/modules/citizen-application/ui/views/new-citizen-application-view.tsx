"use client"

import { CreateCitizenApplicationForm } from "../components/create-citizen-application-form"

export function NewCitizenApplicationView() {
  return (
    <div className="min-h-screen bg-background w-full">
      <main className="w-full px-4 py-8 sm:px-6">
        <CreateCitizenApplicationForm />
      </main>
    </div>
  )
}
