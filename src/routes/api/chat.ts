import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google"; // <-- Import the provider

type ChatRequestBody = {
  messages?: unknown;
  datasetContext?: string;
  selectionCSV?: string;
  selectionLabel?: string | null;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages, datasetContext, selectionCSV, selectionLabel } =
          (await request.json()) as ChatRequestBody;

        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const keyName = "GOOGLE_GENERATIVE_AI_API_KEY";
        const apiKey = (process.env[keyName] || "").trim();
        
        if (!apiKey) {
          return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY in Cloudflare", { status: 500 });
        }

        const google = createGoogleGenerativeAI({ 
          apiKey: apiKey,
          fetch: fetch
        });
        const model = google("models/gemini-1.5-flash");

        const system = [
          "You are a personable, sharp data companion sitting beside the user as they explore a raw dataset.",
// ... (keep the rest of your system prompt and streamText logic exactly the same) ...
          "Be warm, conversational, concise. First-person, no filler. Default to under 5 sentences.",
          "",
          "## How to draw charts",
          "When a chart would help (or the user asks for one), embed it as a fenced ```chart``` block containing JSON of this shape:",
          "```chart",
          '{ "type": "line"|"bar"|"pie"|"scatter"|"area", "title": "...", "caption": "...", "x": "<x-field>", "y": "<y-field>" or ["y1","y2"], "data": [{"<x-field>": ..., "<y-field>": ...}, ...] }',
          "```",
          "Rules:",
          "- ALWAYS include a `data` array. Build it from the user's selection if one exists; otherwise from the full dataset.",
          "- Aggregate when categories repeat (e.g., for pie/bar by category, sum or count).",
          "- Keep `data` under 100 points.",
          "- You may include a brief sentence before/after the chart explaining it.",
          "- Multiple charts are okay — emit multiple ```chart``` blocks.",
          "",
          "Be opinionated about chart choice (trends → line/area, parts-of-whole → pie, comparisons → bar, relationships → scatter).",
          datasetContext ? `\n--- FULL DATASET CONTEXT ---\n${datasetContext}` : "",
          selectionCSV
            ? `\n--- USER'S CURRENT SELECTION (${selectionLabel ?? "selection"}) ---\n${selectionCSV}`
            : "\n--- USER'S CURRENT SELECTION ---\n(none — they haven't highlighted anything yet)",
        ].join("\n");

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
          // Add this error logger:
          onError: ({ error }) => {
            console.error("🚨 GEMINI CRASH REPORT:", error);
          }
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
