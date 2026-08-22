import { SubscriptionPlanFormView } from "@/modules/subscription-plan/components/subscription-plan-form-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSubscriptionPlanPage({ params }: PageProps) {
  const { id } = await params
  return <SubscriptionPlanFormView planId={id} />
}
