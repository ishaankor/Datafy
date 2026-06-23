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

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response(JSON.stringify({ response: "Messages are required" }), { 
            status: 400, headers: { "Content-Type": "application/json" } 
          });
        }

        try {
          const backendUrl = (process.env.PYTHON_BACKEND_URL && process.env.PYTHON_BACKEND_URL !== "undefined") 
            ? process.env.PYTHON_BACKEND_URL 
            : "https://datafy-brain.onrender.com/chat";

          const pythonResponse = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!pythonResponse.ok) {
            console.error("🚨 Python Backend Error");
            return new Response(JSON.stringify({ response: "Error from Python Agent" }), { 
              status: 500, headers: { "Content-Type": "application/json" } 
            });
          }

          const data = await pythonResponse.json();

          return new Response(JSON.stringify(data), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("🚨 Connection Error:", error);
          return new Response(JSON.stringify({ response: "Failed to connect to Python backend. Is it running?" }), { 
            status: 500, headers: { "Content-Type": "application/json" } 
          });
        }
      },
    },
  },
});