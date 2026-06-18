import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
// import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { google } from "@ai-sdk/google";

type ChatRequestBody = {
  messages?: unknown;
  datasetContext?: string;
  selectionCSV?: string;
  selectionLabel?: string | null;
};


function createCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const resolvedOrigin = allowedOrigin ?? origin ?? "*";

  return {
    "access-control-allow-origin": resolvedOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: allowedOrigin ? "Origin" : "",
  } as const;
}

function withCors(request: Request, response: Response) {
  const headers = new Headers(response.headers);
  const corsHeaders = createCorsHeaders(request);

  for (const [key, value] of Object.entries(corsHeaders)) {
    if (value) headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      OPTIONS: ({ request }: { request: Request }) =>
        withCors(request, new Response(null, { status: 204 })),
      POST: async ({ request }: { request: Request }) => {
        const { messages, datasetContext, selectionCSV, selectionLabel } =
          (await request.json()) as ChatRequestBody;

        if (!Array.isArray(messages)) {
          return withCors(request, new Response("Messages are required", { status: 400 }));
        }

        // const key = process.env.LOVABLE_API_KEY;
        // if (!key) {
        //   return withCors(request, new Response("Missing LOVABLE_API_KEY", { status: 500 }));
        // }

        // const gateway = createLovableAiGatewayProvider(key);
        const model = google("google/gemini-1.5-flash-preview");

        const system = [
          "You are a personable, sharp data companion sitting beside the user as they explore a raw dataset.",
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
        });

        return withCors(
          request,
          result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          }),
        );
      },
    },
  },
});
