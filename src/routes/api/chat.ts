import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type ChatRequestBody = {
  messages?: any[];
  datasetContext?: string | null;
  selectionCSV?: string | null;
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

        const pythonPayload = {
          messages: body.messages.map(m => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: typeof m.content === "string" ? m.content : ""
          })),
          datasetContext: body.datasetContext || "",
          selectionCSV: body.selectionCSV || "",
          selectionLabel: body.selectionLabel || ""
        };

        try {
          let backendUrl = process.env.PYTHON_BACKEND_URL as string;
          if (!backendUrl || backendUrl === "undefined" || backendUrl.trim() === "") {
            backendUrl = "https://datafy-brain.onrender.com/chat";
          }

          const pythonResponse = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pythonPayload),
          });

          if (!pythonResponse.ok) {
            const errorText = await pythonResponse.text();
            console.error(`🚨 Python Backend Error [${pythonResponse.status}]:`, errorText);
            return new Response(JSON.stringify({ response: "Error from Python Agent." }), { 
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
          return new Response(JSON.stringify({ response: "Failed to connect to Python backend." }), { 
            status: 500, headers: { "Content-Type": "application/json" } 
          });
        }
      },
    },
  },
});