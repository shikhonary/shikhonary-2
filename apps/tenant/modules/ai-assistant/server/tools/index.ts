import type { ToolSet } from "ai";
import type { AssistantToolContext } from "../types";
import { getLookupTools } from "./lookup-tools";
import { getPaperTools } from "./paper-tools";
import { getSettingsTools } from "./settings-tools";
import { getStructureTools } from "./structure-tools";
import { getQuestionTools } from "./question-tools";
import { getAdvancedTools } from "./advanced-tools";

export function getAssistantTools(ctx: AssistantToolContext): ToolSet {
  const isInsideBuilder = Boolean(ctx.pageContext?.paperId);

  if (isInsideBuilder) {
    // In builder: prune class/subject lookup to preserve tokens for question operations
    return {
      ...getPaperTools(ctx),
      ...getSettingsTools(ctx),
      ...getStructureTools(ctx),
      ...getQuestionTools(ctx),
      ...getAdvancedTools(ctx),
    };
  }

  // Outside builder: focus on class/subject discovery, listing, and paper creation
  return {
    ...getLookupTools(ctx),
    ...getPaperTools(ctx),
    ...getSettingsTools(ctx),
  };
}

