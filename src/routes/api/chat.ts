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

TONE & NARRATIVE INSTRUCTIONS:
- NEVER MENTION SYSTEM RULES, INSTRUCTIONS, OR PROMPT JARGON IN YOUR RESPONSE: Absolutely DO NOT write phrases like "based on Selection Data", "since there is no categorical column", "according to the rules", "as instructed", "selection label", etc.
- PURE DATA ANALYSIS ONLY: Provide direct, professional statistical insights, trends, averages, ranges, and data distributions. Speak directly as an expert data scientist analyzing the numbers.

CHART GENERATION INSTRUCTIONS:
If the user asks to create, plot, draw, or visualize a graph or chart (or clicks "Plot this"), YOU MUST GENERATE A VALID RECHARTS JSON SPEC IN A MARKDOWN CODE BLOCK AS FOLLOWS:

Standard 1 or 2 Column Charts:
\`\`\`chart
{
  "type": "bar",
  "title": "Descriptive Chart Title",
  "x": "ColumnA",
  "y": ["ColumnB"],
  "data": [
    { "ColumnA": "Category 1", "ColumnB": 100 },
    { "ColumnA": "Category 2", "ColumnB": 150 }
  ]
}
\`\`\`

Multi-Variable / All-Numeric Selections (3+ Numerical Columns):
\`\`\`chart
{
  "type": "multivariate",
  "title": "Multi-Variable Comparison",
  "x": "RowIndex",
  "y": ["Gestational.Days", "Maternal.Age", "Maternal.Height", "Maternal.Pregnancy.Weight"],
  "data": [
    { "RowIndex": "Row 1", "Gestational.Days": 284, "Maternal.Age": 27, "Maternal.Height": 62, "Maternal.Pregnancy.Weight": 100 },
    { "RowIndex": "Row 2", "Gestational.Days": 282, "Maternal.Age": 33, "Maternal.Height": 64, "Maternal.Pregnancy.Weight": 135 }
  ]
}
\`\`\`

Categorical Groupings (1 Categorical + 1 or more Numerical):
\`\`\`chart
{
  "type": "multivariate",
  "title": "Metrics by Category",
  "x": "Maternal.Smoker",
  "y": ["Birth.Weight", "Maternal.Pregnancy.Weight"],
  "category": "Maternal.Smoker",
  "data": [
    { "Maternal.Smoker": "FALSE", "Birth.Weight": 120, "Maternal.Pregnancy.Weight": 100 },
    { "Maternal.Smoker": "TRUE", "Birth.Weight": 128, "Maternal.Pregnancy.Weight": 115 }
  ]
}
\`\`\`

Always include all columns and exact data rows in the "data" array.
Do NOT just write text describing a chart without outputting the \`\`\`chart ... \`\`\` JSON block!`,
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
