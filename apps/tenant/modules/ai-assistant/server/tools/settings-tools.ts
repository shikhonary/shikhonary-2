import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { AssistantToolContext } from "../types";

export function getSettingsTools(ctx: AssistantToolContext): ToolSet {
  return {
    updatePaperSettings: tool({
      description: "Safely update layout, typography, page formatting, margins, columns, and OMR settings of a question paper.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper to update"),
        columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().describe("Number of columns on the page (1, 2, or 3)"),
        paperSize: z.enum(["A4", "Letter", "Legal", "A5"]).optional().describe("Paper size"),
        paperOrientation: z.enum(["portrait", "landscape"]).optional().describe("Orientation"),
        fontSize: z.number().min(8).max(24).optional().describe("Base font size (e.g. 11, 12, 13, 14)"),
        fontFamily: z.string().optional().describe("Font family, e.g. 'SolaimanLipi', 'SutonnyMJ', 'Kalpurush'"),
        lineHeight: z.number().min(1).max(2.5).optional().describe("Line height, e.g. 1.3, 1.5, 1.8"),
        headerTemplate: z.enum(["classic", "modern", "minimal", "left-aligned"]).optional().describe("Header layout template style"),
        showColumnDivider: z.boolean().optional().describe("Whether to display a vertical line between columns"),
        margins: z
          .object({
            top: z.number().optional().describe("Top margin in mm (e.g. 15, 20)"),
            bottom: z.number().optional().describe("Bottom margin in mm"),
            left: z.number().optional().describe("Left margin in mm"),
            right: z.number().optional().describe("Right margin in mm"),
          })
          .optional()
          .describe("Page margins in mm"),
        showOMRSheet: z.boolean().optional().describe("Whether to append an OMR answer sheet at the end"),
        omrColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe("Number of columns in the OMR sheet"),
        showWatermark: z.boolean().optional().describe("Show institution watermark"),
        watermark: z.string().optional().describe("Watermark text"),
        institutionName: z.string().optional().describe("Institution name override on header"),
        instructions: z.string().optional().describe("General instructions text on header"),
      }),
      execute: async ({ paperId, omrColumns, ...rest }) => {
        try {
          const patch: any = { ...rest };
          if (typeof omrColumns === "number") {
            patch.omrSettings = { columns: omrColumns };
          }

          const res = await ctx.caller.questionPaper.patchSettings({
            id: paperId,
            patch,
          });

          return {
            ok: true,
            paperId,
            patch: res.patch,
            message: "Question paper settings updated successfully.",
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to update question paper settings",
          };
        }
      },
    }),
  };
}
