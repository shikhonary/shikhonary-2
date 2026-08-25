import { HydrateClient } from "@/trpc/server"
import { CreateQuestionTypePage } from "@/modules/question-type/pages/create-question-type-page"

export default async function CreateQuestionTypeRoute() {
  return (
    <HydrateClient>
      <CreateQuestionTypePage />
    </HydrateClient>
  )
}
