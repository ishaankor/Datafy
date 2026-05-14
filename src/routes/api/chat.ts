import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

type ChatRequestBody = {
  messages?: unknown;
  datasetContext?: string;
  focus?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages, datasetContext, focus } =
          (await request.json()) as ChatRequestBody;

        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system = [
          "You are an editorial data interpreter — concise, elegant, insightful.",
          "Speak with the calm authority of a museum curator. Avoid filler. Use short paragraphs.",
          "When given a dataset, surface non-obvious patterns, outliers, ratios, and what they imply.",
          "Format numbers cleanly. Use markdown sparingly (bold for key findings).",
          datasetContext ? `\n\n--- DATASET ---\n${datasetContext}` : "",
          focus ? `\n\n--- USER IS FOCUSED ON ---\n${focus}` : "",
        ].join("");

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
