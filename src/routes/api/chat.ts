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
          "- TERMINOLOGY MATCHING: The user's UI explicitly counts individual *cells* (rows × columns). You must acknowledge the exact number of cells stated in the selection label (e.g. '4 cells', '6 cells'). Do NOT convert or reduce this number to 'points' or 'rows' in your response.",
          "",
          "## How to draw charts",
          "When a chart would help, embed it as a fenced ```chart``` block containing JSON of this shape:",
          "```chart",
          '{ "type": "line"|"bar"|"pie"|"scatter"|"area", "title": "...", "caption": "...", "colors": ["#F5D061", "#E8912E", "#F8B150"], "x": "<x-field>", "y": "<y-field>" or ["y1","y2"], "data": [{"<x-field>": ..., "<y-field>": ...}, ...] }',
          "```",
          "Rules:",
          "- ALWAYS include tooltips in charts.",
          "- ALWAYS include a `data` array.",
          "- ALWAYS provide a `colors` array using ONLY bright, high-contrast hex colors (like gold #F5D061, orange #E8912E, bright yellow #FFE58F). NEVER use black or dark colors.",
          "- SCATTER PLOTS: You MUST include a descriptive `name` or `label` key inside every single data point object so the tooltip has text to display.",
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