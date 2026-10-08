import type { createCaller } from "@workspace/api";

export type ApiCaller = ReturnType<typeof createCaller>;

export interface PageContext {
  pathname?: string;
  paperId?: string;
}

export interface AssistantToolContext {
  caller: ApiCaller;
  headers: Headers;
  pageContext?: PageContext;
}
