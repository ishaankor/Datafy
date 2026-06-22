import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type ChatRequestBody = {
  messages?: any[];
  datasetContext?: string;
  selectionCSV?: string;
  selectionLabel?: string | null;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as ChatRequestBody;

        console.log("🚨 PROXYING PAYLOAD TO RENDER:", { 
          hasMessages: !!body.messages, 
          datasetContextLength: body.datasetContext?.length || 0,
          selectionCSV: body.selectionCSV ? "HAS SELECTION" : "NO SELECTION",
          selectionLabel: body.selectionLabel || "NO LABEL"
        });

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        try {
          // 1. Forward the entire payload to your live Python FastAPI backend
          const pythonResponse = await fetch("https://datafy-brain.onrender.com/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!pythonResponse.ok) {
            const errorText = await pythonResponse.text();
            console.error("🚨 Python Backend Error:", errorText);
            return new Response("Error from Python Agent", { status: 500 });
          }

          const data = await pythonResponse.json();

          const stream = new ReadableStream({
            start(controller) {
              const textChunk = `0:${JSON.stringify(data.response)}\n`;
              controller.enqueue(new TextEncoder().encode(textChunk));
              controller.close();
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "x-vercel-ai-data-stream": "v1",
            },
          });
        } catch (error) {
          console.error("🚨 Connection Error:", error);
          return new Response("Failed to connect to Python backend. Is your Render server awake?", { status: 500 });
        }
      },
    },
  },
});