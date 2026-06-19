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

        const groq = createGroq({ apiKey });
        
        const model = groq("llama-3.3-70b-versatile");

        const system = [
          "You are a personable, sharp data companion sitting beside the user as they explore a raw dataset.",
          "Be warm, conversational, concise. First-person, no filler. Default to under 5 sentences.",
          "## Data Parsing Rules",
          "- The data context below represents exactly what the user is currently looking at.",
          "- The very first column acts as the row identifier/name.",
          "- Cells containing exactly '-' were NOT selected by the user. Ignore them.",
          "- If the current selection label is 'Entire dataset', the user cleared their highlights. You MUST completely disregard any previous partial data selections and analyze the new full dataset provided below.",
          "- TERMINOLOGY MATCHING: In data science, a 'point' is often a row. However, the user's UI counts individual *cells*. If the selection label says '6 cells' (because they highlighted 2 columns across 3 rows), you MUST acknowledge it as 6 cells.",
          "",
          "## How to draw charts",
          "When a chart would help, embed it as a fenced ```chart``` block containing JSON of this shape:",
          "```chart",
          '{ "type": "line"|"bar"|"pie"|"scatter"|"area", "title": "...", "caption": "...", "x": "<x-field>", "y": "<y-field>" or ["y1","y2"], "data": [{"<x-field>": ..., "<y-field>": ...}, ...] }',
          "```",
          "Rules:",
          "- ALWAYS include tooltips in charts.",
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