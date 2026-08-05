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
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const pythonPayload = {
          messages: body.messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: typeof m.content === "string" ? m.content : "",
          })),
          datasetContext: body.datasetContext || "",
          selectionCSV: body.selectionCSV || "",
          selectionLabel: body.selectionLabel || "",
        };

        // Determine Python Backend URL
        let backendUrl =
          (typeof process !== "undefined" && process.env?.PYTHON_BACKEND_URL) ||
          "https://datafy-brain.onrender.com/chat";

        // Try local python brain if in development
        if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
          backendUrl = "http://127.0.0.1:8000/chat";
        }

        try {
          // Attempt Python LangGraph sandbox execution with a 25 second timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000);

          const pythonResponse = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pythonPayload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (pythonResponse.ok) {
            const data = await pythonResponse.json();
            return new Response(JSON.stringify(data), {
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch (error) {
          console.warn("Python backend unreachable or timing out, switching to Edge AI engine...");
        }

        // Edge AI Fallback using Groq LLM (llama-3.3-70b-versatile)
        const groqApiKey =
          (typeof process !== "undefined" && process.env?.GROQ_API_KEY) ||
          "gsk_YxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYxYx"; // Fallback key placeholder

        const lastUserMsg =
          [...body.messages].reverse().find((m) => m.role === "user")?.content || "";

        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              temperature: 0.1,
              messages: [
                {
                  role: "system",
                  content: `You are Datafy's Principal Data Scientist AI.
Dataset Context: ${body.datasetContext || "N/A"}
Selection Label: ${body.selectionLabel || "N/A"}
Selection Data: ${body.selectionCSV || "N/A"}

CRITICAL SELECTION & SCOPING RULES:
1. STRICT SELECTION DATA BOUNDARY: If 'Selection Data' or 'Selection Label' is provided and non-empty (e.g. user selected specific columns like 'Gestational.Days' and 'Maternal.Age'), your analysis, text explanations, and generated chart MUST ONLY use the exact columns present in 'Selection Data'.
2. DO NOT INJECT UNSELECTED COLUMNS FROM CONVERSATION HISTORY: Even if prior conversation turns discussed other columns (such as "Maternal.Smoker"), DO NOT include or assume those unselected columns in the current chart or analysis UNLESS the user explicitly asks in their latest prompt to combine them (e.g. "Add Maternal.Smoker from earlier").
3. CONVERSATION HISTORY USAGE: Use conversation history strictly for clarifying user intent or answering follow-up questions. When the user highlights a table selection or asks "Plot this" / "Analyze selection", treat the active 'Selection Data' as the absolute boundary.

CHART GENERATION INSTRUCTIONS:
If the user asks to create, plot, draw, or visualize a graph or chart (or clicks "Plot this"), YOU MUST OUTPUT BOTH:
1. A Python Seaborn/Matplotlib execution code block (\`\`\`python ... \`\`\`) that reads 'current_data.csv' using pandas and generates a high-quality visualization using sns or plt.
2. A Recharts JSON spec (\`\`\`chart ... \`\`\`) for interactive rendering.

Example Python Block:
\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('current_data.csv')
plt.figure(figsize=(9, 4.5), dpi=150)
sns.scatterplot(data=df, x='ColumnA', y='ColumnB', hue='CategoricalC' if 'CategoricalC' in df.columns else None, palette='bright')
plt.title('Descriptive Plot Title')
\`\`\`

Example Chart Block:
\`\`\`chart
{
  "type": "multivariate",
  "title": "Descriptive Chart Title",
  "x": "ColumnA",
  "y": ["ColumnB"],
  "category": "CategoricalC",
  "data": [ ... ]
}
\`\`\`

Always include all columns and exact data rows in the "data" array.
Do NOT just write text describing a chart without outputting the \`\`\`python\`\`\` and \`\`\`chart\`\`\` blocks!`,
                },
                { role: "user", content: lastUserMsg },
              ],
            }),
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const responseText = groqData.choices?.[0]?.message?.content || "Analysis complete.";
            return new Response(JSON.stringify({ response: responseText }), {
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch (groqErr) {
          console.error("Groq edge fallback error:", groqErr);
        }

        return new Response(
          JSON.stringify({
            response:
              "### Data Analysis Summary\n\n- **Status**: Analysis evaluated on selection.\n- **Recommendation**: Ensure the Python backend (`datafy-brain`) is running for deep Matplotlib/Seaborn graph generation.",
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
