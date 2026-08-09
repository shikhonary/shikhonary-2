import { HydrateClient } from "@/trpc/server"
import { CqListPage } from "@/modules/cq/pages/cq-list-page"

export default async function CqsRoute() {
  return (
    <HydrateClient>
      <CqListPage />
    </HydrateClient>
  )
}
