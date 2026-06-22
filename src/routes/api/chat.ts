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

        console.log("🚨 PROXYING PAYLOAD TO BACKEND:", { 
          hasMessages: !!body.messages, 
          datasetContextLength: body.datasetContext?.length || 0,
          selectionCSV: body.selectionCSV ? "HAS SELECTION" : "NO SELECTION",
          selectionLabel: body.selectionLabel || "NO LABEL"
        });

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const normalizedMessages = body.messages.map((m) => {
          let textContent = m.content;
          if (!textContent && Array.isArray(m.parts)) {
            textContent = m.parts.map((p: any) => p.text || "").join("");
          }
          return {
            role: m.role,
            content: textContent || "",
          };
        });

        const pythonPayload = {
          ...body,
          messages: normalizedMessages,
        };

        try {
          const backendUrl = "https://datafy-brain.onrender.com/chat";

          const pythonResponse = await fetch(backendUrl as string, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pythonPayload),
          });

          if (!pythonResponse.ok) {
            const errorText = await pythonResponse.text();
            console.error("🚨 Python Backend Error:", errorText);
            return new Response("Error from Python Agent", { status: 500 });
          }

          const data = await pythonResponse.json();

          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              const text = data.response || "";
              
              const chunkSize = 15; 
              for (let i = 0; i < text.length; i += chunkSize) {
                const chunk = text.slice(i, i + chunkSize);
                controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
                await new Promise((resolve) => setTimeout(resolve, 15)); 
              }
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
          return new Response("Failed to connect to Python backend. Is it running?", { status: 500 });
        }
      },
    },
  },
});