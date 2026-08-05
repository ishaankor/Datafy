import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  MessageCircle,
  Table as TableIcon,
  Filter,
  TrendingUp,
  RefreshCw,
  Search,
  ArrowUpDown,
  CheckCircle2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  BarChart2,
  FileSpreadsheet,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Send,
  Sliders,
  Copy,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// SAMPLE DATASETS FOR HOME DEMO
export interface DemoDataset {
  id: string;
  name: string;
  badge: string;
  description: string;
  csv: string;
  xKey: string;
  yKey: string;
  chartType: "bar" | "line" | "area" | "pie";
  prompts: {
    title: string;
    prompt: string;
    response: string;
  }[];
}

export const PRESET_DATASETS: DemoDataset[] = [
  {
    id: "economy",
    name: "Global Tech & Economy",
    badge: "6 Countries × 5 Metrics",
    description: "Macroeconomic growth rates, GDP figures, and technology adoption indices.",
    xKey: "Country",
    yKey: "Growth_Rate",
    chartType: "bar",
    csv: `Country,GDP_Billions,Growth_Rate,Tech_Index,RD_Percent
United States,26854,2.5,94.2,3.4
China,17734,5.2,88.5,2.4
Germany,4456,1.3,91.0,3.1
Japan,4212,1.9,89.4,3.3
India,3730,7.2,84.1,0.7
United Kingdom,3332,0.5,90.2,2.9`,
    prompts: [
      {
        title: "Analyze Growth Leaders",
        prompt: "Which country demonstrates the highest GDP expansion rate and why?",
        response:
          "**India** leads all economies in GDP growth rate at **7.2%**, significantly outperforming mature markets (US: 2.5%, Germany: 1.3%). While its current Tech Index (84.1) trails the US (94.2), rapid tech ecosystem expansion and demographic dividends drive aggressive growth.",
      },
      {
        title: "Correlate R&D with Tech Index",
        prompt: "Is there a strong connection between R&D spending % and Tech Index?",
        response:
          "Yes. High R&D spenders like **United States (3.4%)** and **Japan (3.3%)** hold top Tech Index scores of **94.2** and **89.4** respectively. Investing over 3% of GDP directly correlates with frontier tech capability.",
      },
      {
        title: "Executive Summary Brief",
        prompt: "Provide an executive summary of this macroeconomic dataset.",
        response:
          "The dataset reveals a contrast between high-growth emerging economies (**India 7.2%**, **China 5.2%**) and tech-dense mature markets (**US $26.8T GDP**, **Germany 91.0 Tech Index**). Strategy recommendation: allocate capital to India for expansion, US for technological innovation.",
      },
    ],
  },
  {
    id: "ai_models",
    name: "AI LLM Benchmarks 2026",
    badge: "5 Frontier Models × 5 Metrics",
    description: "Reasoning capabilities, coding benchmarks, latency, and cost per million tokens.",
    xKey: "Model",
    yKey: "MMLU_Pro",
    chartType: "bar",
    csv: `Model,MMLU_Pro,Coding_Eval,Latency_ms,Cost_Per_1M
Gemini 3.6 Pro,88.4,92.1,310,1.25
Claude 3.5 Sonnet,88.7,93.4,420,3.00
GPT-4o,87.2,90.2,280,2.50
Llama 3.3 70B,83.1,86.5,190,0.40
DeepSeek V3,87.8,91.8,240,0.28`,
    prompts: [
      {
        title: "Find Best Value Model",
        prompt: "Which model offers the best accuracy-to-cost ratio for developer workflows?",
        response:
          "**DeepSeek V3** and **Llama 3.3 70B** stand out. DeepSeek V3 achieves **87.8% MMLU Pro** and **91.8% Coding Eval** at just **$0.28 per 1M tokens**, offering nearly Sonnet-tier coding precision at 1/10th the cost.",
      },
      {
        title: "Speed vs Accuracy Analysis",
        prompt: "Compare inference latency against reasoning performance.",
        response:
          "**Llama 3.3 70B** is the fastest model in the group at **190ms latency**, followed by DeepSeek V3 at **240ms**. Gemini 3.6 Pro balances high coding eval (**92.1%**) with snappy 310ms latency.",
      },
      {
        title: "Coding Leaderboard",
        prompt: "Which model tops the software engineering benchmark?",
        response:
          "**Claude 3.5 Sonnet** leads coding evaluations at **93.4%**, closely followed by **Gemini 3.6 Pro (92.1%)** and **DeepSeek V3 (91.8%)**.",
      },
    ],
  },
  {
    id: "saas_metrics",
    name: "SaaS Performance & Churn",
    badge: "6 Months × 5 Metrics",
    description: "Monthly recurring revenue, churn rate, customer acquisition cost, and net retention.",
    xKey: "Month",
    yKey: "MRR_Thousands",
    chartType: "area",
    csv: `Month,MRR_Thousands,New_MRR,Churn_Rate,CAC_Dollars
Jan 2026,120,18,1.8,420
Feb 2026,134,22,1.5,395
Mar 2026,152,25,1.2,380
Apr 2026,175,31,1.1,360
May 2026,205,38,0.9,340
Jun 2026,242,46,0.8,325`,
    prompts: [
      {
        title: "Evaluate Churn Trend",
        prompt: "How is customer churn trending over the 6-month period?",
        response:
          "Churn rate has dropped steadily from **1.8% in Jan 2026** down to **0.8% in Jun 2026**—a **55.5% improvement** in customer retention alongside doubling MRR from $120k to $242k.",
      },
      {
        title: "Analyze Acquisition Efficiency",
        prompt: "What is happening to Customer Acquisition Cost (CAC)?",
        response:
          "CAC decreased from **$420 to $325** (-22.6%) while New MRR expanded from **$18k to $46k/mo**, signaling accelerating organic flywheel growth and improved payback periods.",
      },
      {
        title: "Project Q3 MRR",
        prompt: "Forecast MRR trajectory based on current growth velocity.",
        response:
          "With monthly growth averaging **15.1%** and accelerating New MRR (+25.6% MoM in June), MRR is projected to cross **$300k by August 2026**.",
      },
    ],
  },
];

const GOLD = "oklch(0.78 0.13 80)";
const CHART_COLORS = [
  "oklch(0.78 0.13 80)",
  "oklch(0.88 0.09 85)",
  "oklch(0.65 0.11 70)",
  "oklch(0.55 0.08 60)",
  "oklch(0.42 0.05 50)",
  "oklch(0.80 0.15 40)",
];

export function HomeDemo() {
  const navigate = useNavigate();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("economy");
  const [customCsvInput, setCustomCsvInput] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"table" | "chart" | "ai">("table");

  // Table state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);

  // Chart State
  const [selectedChartType, setSelectedChartType] = useState<"bar" | "line" | "area" | "pie">(
    "bar"
  );
  const [overrideXKey, setOverrideXKey] = useState<string | null>(null);
  const [overrideYKey, setOverrideYKey] = useState<string | null>(null);

  // AI Chat State
  const [activePromptIndex, setActivePromptIndex] = useState<number>(0);
  const [customPromptInput, setCustomPromptInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string; time: string }[]
  >([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active dataset object
  const activePreset = useMemo(() => {
    return PRESET_DATASETS.find((d) => d.id === selectedDatasetId) || PRESET_DATASETS[0];
  }, [selectedDatasetId]);

  // Current CSV string
  const activeCsvString = useMemo(() => {
    if (isCustomMode && customCsvInput.trim()) {
      return customCsvInput.trim();
    }
    return activePreset.csv;
  }, [isCustomMode, customCsvInput, activePreset]);

  // Parsed Table Data
  const parsedData = useMemo(() => {
    const lines = activeCsvString.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const rowObj: Record<string, string | number> = {};
      headers.forEach((h, idx) => {
        const val = vals[idx] ?? "";
        const num = Number(val);
        rowObj[h] = !isNaN(num) && val !== "" ? num : val;
      });
      return rowObj;
    });
    return { headers, rows };
  }, [activeCsvString]);

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    let rows = [...parsedData.rows];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (sortColumn && parsedData.headers.includes(sortColumn)) {
      rows.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return rows;
  }, [parsedData, searchQuery, sortColumn, sortDirection]);

  // Numerical Columns for Chart Y-Axis
  const numericColumns = useMemo(() => {
    if (parsedData.rows.length === 0) return [];
    const firstRow = parsedData.rows[0];
    return parsedData.headers.filter((h) => typeof firstRow[h] === "number");
  }, [parsedData]);

  // Effective chart keys
  const xKey = overrideXKey || parsedData.headers[0] || "Label";
  const yKey = overrideYKey || numericColumns[0] || parsedData.headers[1] || "Value";
  const chartType = selectedChartType || activePreset.chartType;

  // Live Stats of Selected Column or Data
  const cellStats = useMemo(() => {
    if (!selectedCell || !parsedData.rows.length) return null;
    const colName = selectedCell.col;
    const values = parsedData.rows
      .map((r) => r[colName])
      .filter((v): v is number => typeof v === "number");

    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { colName, count: values.length, sum, avg, min, max };
  }, [selectedCell, parsedData]);

  // Switch Dataset
  const handleSelectPreset = (ds: DemoDataset) => {
    setIsCustomMode(false);
    setSelectedDatasetId(ds.id);
    setSelectedRowIndex(0);
    setSelectedCell(null);
    setSearchQuery("");
    setSortColumn(null);
    setOverrideXKey(null);
    setOverrideYKey(null);
    setSelectedChartType(ds.chartType);
    setActivePromptIndex(0);
    setChatMessages([
      {
        role: "assistant",
        content: `Loaded dataset **${ds.name}**. Ask me to analyze key metrics, detect outliers, or render visualizations!`,
        time: "Just now",
      },
    ]);
  };

  // Launch Workspace with prefilled CSV
  const handleLaunchWithData = () => {
    try {
      sessionStorage.setItem("datafy_demo_csv", activeCsvString);
      sessionStorage.setItem(
        "datafy_demo_name",
        isCustomMode ? "Custom Demo Dataset" : activePreset.name
      );
    } catch {
      // ignore fallback
    }
    navigate({ to: "/workspace" });
  };

  // Run AI Prompt
  const handleRunPresetPrompt = (index: number) => {
    setActivePromptIndex(index);
    const target = activePreset.prompts[index];
    if (!target) return;

    const userMsg = {
      role: "user" as const,
      content: target.prompt,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);
    setActiveTab("ai");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: target.response,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsAiThinking(false);
    }, 600);
  };

  const handleSendCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptInput.trim()) return;

    const promptText = customPromptInput;
    setCustomPromptInput("");

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user" as const,
        content: promptText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setIsAiThinking(true);
    setActiveTab("ai");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: `Analyzed dataset with target prompt: "${promptText}". In full workspace, Datafy passes the exact cell selections and dataset context to AI models. Click 'Launch Full Workspace' to perform complete live queries!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsAiThinking(false);
    }, 700);
  };

  const toggleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  return (
    <div id="demo" className="space-y-8 scroll-mt-20">
      {/* SECTION TITLE & PRESET SWITCHER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Playground</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          Test Datafy Live in Your Browser
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto font-serif">
          Experience cell selections, column sorting, dynamic chart generation, and inline AI
          curator responses without signing up.
        </p>

        {/* PRESET DATASET PILLS */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {PRESET_DATASETS.map((ds) => {
            const isSelected = !isCustomMode && selectedDatasetId === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => handleSelectPreset(ds)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-gold text-ink font-semibold border-gold shadow-md shadow-gold/20 scale-[1.02]"
                    : "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border-border/60"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{ds.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-ink/15 text-ink" : "bg-gold/10 text-gold"
                  }`}
                >
                  {ds.badge.split(" × ")[0]}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setIsCustomMode(true);
              setActiveTab("table");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
              isCustomMode
                ? "bg-gold text-ink font-semibold border-gold shadow-md shadow-gold/20 scale-[1.02]"
                : "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border-border/60"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-gold" />
            <span>Paste Custom CSV</span>
          </button>
        </div>
      </div>

      {/* MAIN DEMO CANVAS BOX */}
      <div className="rounded-2xl bg-card/40 border border-gold/30 shadow-2xl backdrop-blur-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 border-t-2 border-t-gold">
        {/* LEFT / TOP CONTROL HEADER & TABS */}
        <div className="lg:col-span-12 bg-background/80 border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* DATASET METADATA BADGE */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-foreground font-semibold">
                {isCustomMode ? "Custom CSV Data" : activePreset.name}
              </span>
              <span className="text-muted-foreground">
                ({parsedData.rows.length} Rows × {parsedData.headers.length} Cols)
              </span>
            </div>
          </div>

          {/* VIEW TAB SWITCHER (TABLE / CHART / AI SIDEKICK) */}
          <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border/60">
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "table"
                  ? "bg-gold text-ink font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Interactive Table
            </button>
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "chart"
                  ? "bg-gold text-ink font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Recharts Visualizer
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "ai"
                  ? "bg-gold text-ink font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> AI Curator Sidekick
            </button>
          </div>

          {/* LAUNCH WORKSPACE ACTION */}
          <Button
            size="sm"
            onClick={handleLaunchWithData}
            className="bg-gold hover:bg-gold-soft text-ink font-medium text-xs rounded-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Open Full Workspace{" "}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* CUSTOM CSV INPUT AREA (WHEN CUSTOM MODE ACTIVE) */}
        {isCustomMode && (
          <div className="lg:col-span-12 p-4 bg-background/90 border-b border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-gold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Paste Raw CSV Text Below:
              </span>
              <button
                onClick={() =>
                  setCustomCsvInput(
                    `Product,Q1_Sales,Q2_Sales,Satisfaction_Score\nAlpha,4500,5200,4.8\nBeta,3100,4100,4.5\nGamma,6800,7200,4.9\nDelta,1900,2400,4.2`
                  )
                }
                className="text-[11px] text-muted-foreground hover:text-gold underline font-mono"
              >
                Insert Sample SaaS Dataset
              </button>
            </div>
            <textarea
              rows={4}
              value={customCsvInput}
              onChange={(e) => setCustomCsvInput(e.target.value)}
              placeholder="Country,GDP,Growth Rate&#10;USA,26854,2.5&#10;Japan,4212,1.9"
              className="w-full p-3 rounded-lg bg-card/60 border border-border font-mono text-xs text-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        )}

        {/* MAIN BODY AREA (SPLIT SCREEN ON DESKTOP) */}
        <div className="lg:col-span-7 border-r border-border p-4 space-y-4 bg-background/30 flex flex-col justify-between min-h-[460px]">
          {/* TAB 1: INTERACTIVE TABLE */}
          {activeTab === "table" && (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              {/* TABLE CONTROLS BAR */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search rows or values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-card/70 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Click any cell to highlight context
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto rounded-lg border border-border/80 bg-background/80 flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-card/60 font-mono text-muted-foreground">
                      <th className="p-2.5 text-[11px] text-center w-8">#</th>
                      {parsedData.headers.map((header) => {
                        const isSorted = sortColumn === header;
                        return (
                          <th
                            key={header}
                            onClick={() => toggleSort(header)}
                            className="p-2.5 font-semibold text-foreground cursor-pointer hover:bg-card/80 transition-colors whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{header}</span>
                              <ArrowUpDown
                                className={`w-3 h-3 ${
                                  isSorted ? "text-gold" : "text-muted-foreground/50"
                                }`}
                              />
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {processedRows.map((row, rIdx) => {
                      const isRowSelected = selectedRowIndex === rIdx;
                      return (
                        <tr
                          key={rIdx}
                          onClick={() => setSelectedRowIndex(rIdx)}
                          className={`border-b border-border/40 transition-colors cursor-pointer ${
                            isRowSelected
                              ? "bg-gold/10 text-foreground font-medium"
                              : "hover:bg-card/40 text-foreground/90"
                          }`}
                        >
                          <td className="p-2.5 text-[10px] font-mono text-muted-foreground text-center">
                            {rIdx + 1}
                          </td>
                          {parsedData.headers.map((header) => {
                            const val = row[header];
                            const isCellSelected =
                              selectedCell?.row === rIdx && selectedCell?.col === header;
                            return (
                              <td
                                key={header}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRowIndex(rIdx);
                                  setSelectedCell({ row: rIdx, col: header });
                                }}
                                className={`p-2.5 font-mono whitespace-nowrap transition-colors ${
                                  isCellSelected
                                    ? "bg-gold/30 text-gold font-bold ring-1 ring-gold rounded-xs"
                                    : ""
                                }`}
                              >
                                {typeof val === "number"
                                  ? val.toLocaleString()
                                  : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* STATS TICKER FOOTER */}
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/80 flex flex-wrap items-center justify-between text-[11px] font-mono gap-2 text-muted-foreground">
                {cellStats ? (
                  <div className="flex items-center gap-3 text-gold">
                    <span className="font-semibold">Column: {cellStats.colName}</span>
                    <span>Sum: {cellStats.sum.toLocaleString()}</span>
                    <span>Avg: {cellStats.avg.toFixed(2)}</span>
                    <span>Min: {cellStats.min}</span>
                    <span>Max: {cellStats.max}</span>
                  </div>
                ) : (
                  <span>
                    Select row {selectedRowIndex !== null ? `#${selectedRowIndex + 1}` : ""} — Click
                    a numerical cell to compute dynamic column summary statistics.
                  </span>
                )}
                <span className="text-[10px] text-gold/80 bg-gold/10 px-2 py-0.5 rounded">
                  Live Engine
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: RECHARTS VISUALIZER */}
          {activeTab === "chart" && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* CHART CONFIG TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-card/60 border border-border/60 text-xs">
                {/* CHART TYPE SELECTOR */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedChartType("bar")}
                    className={`p-1.5 rounded ${
                      chartType === "bar"
                        ? "bg-gold text-ink font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Bar Chart"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedChartType("line")}
                    className={`p-1.5 rounded ${
                      chartType === "line"
                        ? "bg-gold text-ink font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Line Chart"
                  >
                    <LineIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedChartType("area")}
                    className={`p-1.5 rounded ${
                      chartType === "area"
                        ? "bg-gold text-ink font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Area Chart"
                  >
                    <AreaIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedChartType("pie")}
                    className={`p-1.5 rounded ${
                      chartType === "pie"
                        ? "bg-gold text-ink font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Pie / Donut Chart"
                  >
                    <PieIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Y-AXIS SELECTION */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">Metric:</span>
                  <select
                    value={yKey}
                    onChange={(e) => setOverrideYKey(e.target.value)}
                    className="bg-card border border-border text-foreground text-xs rounded px-2 py-1 focus:outline-none focus:border-gold font-mono"
                  >
                    {numericColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RECHARTS CONTAINER */}
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={parsedData.rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 70 / 0.3)" />
                      <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.14 0.005 60)",
                          border: "1px solid oklch(0.78 0.13 80 / 0.5)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey={yKey} fill={GOLD} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : chartType === "line" ? (
                    <LineChart data={parsedData.rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 70 / 0.3)" />
                      <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.14 0.005 60)",
                          border: "1px solid oklch(0.78 0.13 80 / 0.5)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={GOLD}
                        strokeWidth={3}
                        dot={{ r: 5, fill: GOLD }}
                      />
                    </LineChart>
                  ) : chartType === "area" ? (
                    <AreaChart data={parsedData.rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 70 / 0.3)" />
                      <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.14 0.005 60)",
                          border: "1px solid oklch(0.78 0.13 80 / 0.5)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={yKey}
                        stroke={GOLD}
                        fill="oklch(0.78 0.13 80 / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={parsedData.rows}
                        dataKey={yKey}
                        nameKey={xKey}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {parsedData.rows.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.14 0.005 60)",
                          border: "1px solid oklch(0.78 0.13 80 / 0.5)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-muted-foreground font-mono text-center pt-2">
                Plotting <span className="text-gold font-semibold">{yKey}</span> across{" "}
                <span className="text-gold font-semibold">{xKey}</span> using Recharts SVG engine.
              </div>
            </div>
          )}

          {/* TAB 3: AI CURATOR SIDEKICK */}
          {activeTab === "ai" && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* CHAT MESSAGES DISPLAY */}
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                      msg.role === "user"
                        ? "bg-card border border-border text-foreground ml-6"
                        : "bg-gold/10 border border-gold/30 text-foreground mr-6 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-semibold text-gold">
                        {msg.role === "assistant" ? (
                          <>
                            <Sparkles className="w-3 h-3" /> AI Sidekick Curator
                          </>
                        ) : (
                          "You"
                        )}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="leading-relaxed font-sans text-foreground/90 whitespace-pre-line">
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-xs text-gold flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-mono">Analyzing rows and computing insights...</span>
                  </div>
                )}
              </div>

              {/* INPUT PROMPT FIELD */}
              <form onSubmit={handleSendCustomPrompt} className="flex gap-2">
                <input
                  type="text"
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  placeholder="Ask a question about this data..."
                  className="flex-1 px-3 py-2 rounded-lg bg-card/80 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gold hover:bg-gold-soft text-ink px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: QUICK AI PROMPT RECIPES & CURATOR INSIGHTS */}
        <div className="lg:col-span-5 p-5 bg-background/60 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-display font-bold text-base text-foreground">
                AI Curator Prompt Recipes
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click any of the pre-configured analysis prompts below to see how Datafy evaluates
              numerical metrics and writes editorial insights.
            </p>

            {/* PRESET PROMPTS BUTTON LIST */}
            <div className="space-y-2">
              {activePreset.prompts.map((p, idx) => {
                const isActive = activePromptIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleRunPresetPrompt(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-gold/15 border-gold text-foreground shadow-sm"
                        : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-card/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-gold shrink-0" />
                        {p.title}
                      </p>
                      <p className="text-[11px] line-clamp-1 opacity-80">{p.prompt}</p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? "text-gold translate-x-0.5" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDITORIAL SUMMARY PREVIEW BOX */}
          <div className="p-4 rounded-xl bg-card border border-gold/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-gold flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Editorial Synthesis Output
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Markdown Ready</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed font-serif italic border-l-2 border-gold pl-3 py-0.5">
              "{activePreset.prompts[activePromptIndex]?.response.replace(/\*\*/g, "")}"
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-mono">
                Context: {activePreset.name}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    activePreset.prompts[activePromptIndex]?.response || ""
                  );
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-gold hover:underline font-mono flex items-center gap-1"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Summary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
