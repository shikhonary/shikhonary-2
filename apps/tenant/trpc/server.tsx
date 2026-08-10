import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { appRouter, createTRPCContext as createApiContext } from "@workspace/api";
import { headers } from "next/headers";
import { cache } from "react";
import { getQueryClient } from "./query-client";

const getContext = cache(async () => {
  const h = await headers();
  return createApiContext({ headers: h });
});

export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: getContext,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
