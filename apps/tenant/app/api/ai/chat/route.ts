// Turbopack route refresh 2026-10-08-v2
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { auth } from "@workspace/auth/server";
import { createCaller, createTRPCContext } from "@workspace/api";
import { getGroqModel } from "@/modules/ai-assistant/server/model";
import { getSystemPrompt } from "@/modules/ai-assistant/server/system-prompt";
import { getAssistantTools } from "@/modules/ai-assistant/server/tools";
import type { PageContext } from "@/modules/ai-assistant/server/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Parse request body
    const body = await req.json();
    const { messages, context } = body as {
      messages: any[];
      context?: PageContext;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Create tenant-scoped API caller
    const trpcContext = await createTRPCContext({ headers: req.headers });
    const caller = createCaller(trpcContext);

    // 4. Resolve Model & Tools
    const model = getGroqModel();
    const systemPrompt = getSystemPrompt(context);
    const tools = getAssistantTools({
      caller,
      headers: req.headers,
      pageContext: context,
    });

    // 5. Convert UI messages to model messages (capped to recent 8 to preserve token budget)
    const recentMessages = messages.length > 8 ? messages.slice(-8) : messages;
    const modelMessages = await convertToModelMessages(recentMessages);

    // 6. Stream completion with tool loop and token usage/cost logging
    const provider = process.env.AI_PROVIDER || "google";
    const modelName =
      process.env.AI_MODEL || (provider === "google" ? "gemini-flash-latest" : "llama-3.3-70b-versatile");

    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(8),
      onFinish: async ({ usage, steps, finishReason }) => {
        const inputTokens = (usage as any)?.promptTokens ?? (usage as any)?.inputTokens ?? 0;
        const outputTokens = (usage as any)?.completionTokens ?? (usage as any)?.outputTokens ?? 0;
        const totalTokens = (usage as any)?.totalTokens ?? (inputTokens + outputTokens);

        // Standard rate estimation (Gemini Flash: $0.075 / 1M in, $0.30 / 1M out; Free tier = $0.00)
        const costUsd =
          (inputTokens / 1_000_000) * 0.075 + (outputTokens / 1_000_000) * 0.3;

        console.log(`\n┌────────────────── 📊 AI TOKEN & COST LOG ──────────────────┐`);
        console.log(`│ 🤖 Provider & Model: ${provider.toUpperCase()} (${modelName})`);
        console.log(`│ 📥 Input Tokens:     ${String(inputTokens.toLocaleString()).padEnd(37)}│`);
        console.log(`│ 📤 Output Tokens:    ${String(outputTokens.toLocaleString()).padEnd(37)}│`);
        console.log(`│ 🔢 Total Tokens:     ${String(totalTokens.toLocaleString()).padEnd(37)}│`);
        console.log(`│ 🔄 Steps Executed:   ${String(steps?.length || 1).padEnd(37)}│`);
        console.log(`│ 🏁 Finish Reason:    ${String(finishReason || "stop").padEnd(37)}│`);
        console.log(`│ 💵 Estimated Cost:   $${costUsd.toFixed(6)} USD (FREE on Google Tier) │`);
        if (steps && steps.length > 1) {
          console.log(`├───────────────────── 🛠️ Multi-Step Tools ────────────────────┤`);
          steps.forEach((s, idx) => {
            const toolNames =
              (s.toolCalls || []).map((t: any) => t.toolName || t.name).join(", ") || "text";
            const stepIn = (s.usage as any)?.promptTokens ?? (s.usage as any)?.inputTokens ?? 0;
            const stepOut = (s.usage as any)?.completionTokens ?? (s.usage as any)?.outputTokens ?? 0;
            console.log(`│ Step ${idx + 1}: ${toolNames.slice(0, 30)} | In: ${stepIn}, Out: ${stepOut}`);
          });
        }
        console.log(`└────────────────────────────────────────────────────────────┘\n`);
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (err) => {
        const msg = String(err);
        if (
          msg.includes("429") ||
          msg.toLowerCase().includes("rate limit") ||
          msg.toLowerCase().includes("tpm")
        ) {
          return "গ্রক এআই-এর ট্রাফিকের কারণে অনুরোধ সাময়িকভাবে বিলম্বিত হচ্ছে। অনুগ্রহ করে ৩০ সেকেন্ড পর আবার চেষ্টা করুন।";
        }
        return "এআই প্রক্রিয়াকরণে একটি ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।";
      },
    });
  } catch (err: any) {
    console.error("[/api/ai/chat error]:", err);
    let message =
      err?.message ||
      "An unexpected error occurred while processing the AI request.";
    const isRateLimit =
      err?.status === 429 ||
      err?.statusCode === 429 ||
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("tpm");

    if (isRateLimit) {
      message =
        "গ্রক এআই-এর সীমা (Rate Limit) অতিক্রম করেছে। অনুগ্রহ করে ৩০ সেকেন্ড পর আবার চেষ্টা করুন।";
    }

    return new Response(JSON.stringify({ error: message }), {
      status: isRateLimit ? 429 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
