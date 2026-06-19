import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGroq } from "@ai-sdk/groq";

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

        console.log("🚨 SERVER RECEIVED PAYLOAD:", { 
          hasMessages: !!messages, 
          datasetContextLength: datasetContext?.length || 0,
          selectionCSV: selectionCSV || "NO SELECTION",
          selectionLabel: selectionLabel || "NO LABEL"
        });
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = (process.env.GROQ_API_KEY || "").trim();
        
        if (!apiKey) {
          return new Response("Missing GROQ_API_KEY", { status: 500 });
        }

        // 1. Initialize Groq instead of Google
        const groq = createGroq({ apiKey });
        
        // 2. Use the fast, versatile Llama 3.3 model
        const model = groq("llama-3.3-70b-versatile");

        const system = [
          "You are a personable, sharp data companion sitting beside the user as they explore a raw dataset.",
          "Be warm, conversational, concise. First-person, no filler. Default to under 5 sentences.",
          "Always generate questions that target mathematical concepts.",
          "",
          "## How to draw charts",
          "When a chart would help, embed it as a fenced ```chart``` block containing JSON of this shape:",
          "```chart",
          '{ "type": "line"|"bar"|"pie"|"scatter"|"area", "title": "...", "caption": "...", "x": "<x-field>", "y": "<y-field>" or ["y1","y2"], "data": [{"<x-field>": ..., "<y-field>": ...}, ...] }',
          "```",
          "Rules:",
          "- ALWAYS include a `data` array.",
          "- Aggregate when categories repeat.",
          "- Keep `data` under 100 points.",
          "- Be opinionated about chart choice.",
          selectionCSV
            ? `\n--- USER'S CURRENT SELECTION (${selectionLabel ?? "selection"}) ---\n${selectionCSV}`
            : `\n--- FULL DATASET CONTEXT ---\n${datasetContext}`,
        ].join("\n");

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
          onError: ({ error }) => {
            console.error("🚨 GROQ CRASH REPORT:", error);
          }
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});