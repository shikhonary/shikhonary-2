"use client";

import "client-only";

import type { AppRouter } from "@workspace/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
  createTRPCContext,
  createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import { useState } from "react";
import { getQueryClient } from "./query-client";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3001}`;
}

function makeTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}

const { TRPCProvider } = createTRPCContext<AppRouter>();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: makeTRPCClient(),
  queryClient: getQueryClient,
});

export function TRPCReactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(makeTRPCClient);

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TRPCProvider>
  );
}
