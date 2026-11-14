import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ContentTrackerPage } from "@/modules/content-tracker"

export const metadata = {
  title: "কনটেন্ট পাইপলাইন ও প্রুফিং ট্র্যাকার | Shikhonary Admin",
  description: "সিলেবাস কাভারেজ, ডায়াগ্রাম সংযুক্তি এবং অ্যাক্টিভ প্রুফরিডিং স্ট্যাটাস নিরীক্ষণ ও পরিচালনা করুন।",
}

export default async function Page() {
  const queryClient = getQueryClient()

  // Prefetch initial academic classes for selection
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 }),
  )

  return (
    <HydrateClient>
      <ContentTrackerPage />
    </HydrateClient>
  )
}
