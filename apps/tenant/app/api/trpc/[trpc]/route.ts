import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@workspace/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    responseMeta: () => ({
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`tRPC error on [${path ?? "<no-path>"}]:`, error);
          }
        : ({ path, error }) => {
            console.error(`tRPC error on [${path ?? "<no-path>"}]: ${error.message}`);
          },
  });

export { handler as GET, handler as POST };
