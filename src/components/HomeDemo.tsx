import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  MessageCircle,
  Table as TableIcon,
  Search,
  ArrowUpDown,
  PieChart as PieIcon,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  BarChart2,
  FileSpreadsheet,
  ChevronRight,
  Send,
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
    <section id="demo" className="sandbox-section" aria-labelledby="sandbox-heading">
      {/* SECTION TITLE & PRESET SWITCHER */}
      <header className="section-heading">
        <p className="eyebrow">Interactive Sandbox</p>
        <h2 id="sandbox-heading">Explore a sample dataset in your browser</h2>
        <p>
          Sort columns, inspect cell statistics, switch chart views, or test sample inquiries before
          opening the full workspace.
        </p>

        {/* PRESET DATASET PILLS */}
        <div className="preset-switcher" role="group" aria-label="Sample datasets">
          {PRESET_DATASETS.map((ds) => {
            const isSelected = !isCustomMode && selectedDatasetId === ds.id;
            return (
              <button
                key={ds.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectPreset(ds)}
                className="preset-btn"
              >
                <FileSpreadsheet size={14} aria-hidden="true" />
                <span>{ds.name}</span>
                <span className="preset-btn__meta">{ds.badge.split(" × ")[0]}</span>
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={isCustomMode}
            onClick={() => {
              setIsCustomMode(true);
              setActiveTab("table");
            }}
            className="preset-btn"
          >
            <span>Paste Custom CSV</span>
          </button>
        </div>
      </header>

      {/* MAIN DEMO CANVAS BOX */}
      <div className="sandbox-frame">
        {/* LEFT / TOP CONTROL HEADER & TABS */}
        <div className="sandbox-toolbar">
          <div className="sandbox-breadcrumb">
            / {isCustomMode ? "custom.csv" : activePreset.name} · {parsedData.rows.length} rows ×{" "}
            {parsedData.headers.length} cols
          </div>

          {/* VIEW TAB SWITCHER */}
          <div className="sandbox-tablist" role="tablist" aria-label="Sandbox view mode">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "table"}
              onClick={() => setActiveTab("table")}
              className="sandbox-tab"
            >
              <TableIcon size={14} aria-hidden="true" />
              <span>Table</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "chart"}
              onClick={() => setActiveTab("chart")}
              className="sandbox-tab"
            >
              <BarChart3 size={14} aria-hidden="true" />
              <span>Chart</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "ai"}
              onClick={() => setActiveTab("ai")}
              className="sandbox-tab"
            >
              <MessageCircle size={14} aria-hidden="true" />
              <span>Sidekick</span>
            </button>
          </div>

          <button type="button" onClick={handleLaunchWithData} className="btn-editorial">
            <span>Open in Workspace</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>

        {/* CUSTOM CSV INPUT AREA */}
        {isCustomMode && (
          <div style={{ gridColumn: "1 / -1", padding: "1rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.75rem" }}>
              <label htmlFor="custom-csv-textarea" className="sandbox-breadcrumb">
                Paste comma-separated values:
              </label>
              <button
                type="button"
                onClick={() =>
                  setCustomCsvInput(
                    `Product,Q1_Sales,Q2_Sales,Satisfaction_Score\nAlpha,4500,5200,4.8\nBeta,3100,4100,4.5\nGamma,6800,7200,4.9\nDelta,1900,2400,4.2`
                  )
                }
                className="dataset-chip"
              >
                Load sample CSV
              </button>
            </div>
            <textarea
              id="custom-csv-textarea"
              rows={4}
              value={customCsvInput}
              onChange={(e) => setCustomCsvInput(e.target.value)}
              placeholder="Country,GDP,Growth Rate&#10;USA,26854,2.5&#10;Japan,4212,1.9"
              style={{ width: "100%", padding: "0.75rem", background: "var(--surface-glass)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--foreground)" }}
            />
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="sandbox-stage">
          {/* TAB 1: INTERACTIVE TABLE */}
          {activeTab === "table" && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "18rem" }}>
                  <Search size={14} aria-hidden="true" style={{ position: "absolute", left: "0.65rem", top: "0.55rem", color: "var(--muted-foreground)" }} />
                  <input
                    type="search"
                    aria-label="Filter table rows"
                    placeholder="Search rows or values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.375rem 0.75rem 0.375rem 2rem", borderRadius: "var(--radius)", background: "var(--surface-elevated)", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--foreground)" }}
                  />
                </div>
                <span className="sandbox-breadcrumb">Click any cell to highlight context</span>
              </div>

              <div className="sandbox-table-wrap">
                <table className="sandbox-table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      {parsedData.headers.map((header) => {
                        const isSorted = sortColumn === header;
                        return (
                          <th key={header} scope="col" onClick={() => toggleSort(header)}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              <span>{header}</span>
                              <ArrowUpDown
                                size={12}
                                aria-hidden="true"
                                style={{ color: isSorted ? "var(--gold)" : "var(--muted-foreground)" }}
                              />
                            </span>
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
                          data-selected={isRowSelected}
                          onClick={() => setSelectedRowIndex(rIdx)}
                        >
                          <td>{rIdx + 1}</td>
                          {parsedData.headers.map((header) => {
                            const val = row[header];
                            const isCellSelected =
                              selectedCell?.row === rIdx && selectedCell?.col === header;
                            return (
                              <td
                                key={header}
                                data-cell-active={isCellSelected}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRowIndex(rIdx);
                                  setSelectedCell({ row: rIdx, col: header });
                                }}
                              >
                                {typeof val === "number" ? val.toLocaleString() : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="sandbox-statusbar">
                {cellStats ? (
                  <div style={{ display: "flex", gap: "1rem", color: "var(--foreground)" }}>
                    <strong style={{ color: "var(--gold)" }}>{cellStats.colName}</strong>
                    <span>n={cellStats.count}</span>
                    <span>Σ {cellStats.sum.toLocaleString()}</span>
                    <span>μ {cellStats.avg.toFixed(2)}</span>
                    <span>min {cellStats.min}</span>
                    <span>max {cellStats.max}</span>
                  </div>
                ) : (
                  <span>
                    Row {selectedRowIndex !== null ? `#${selectedRowIndex + 1}` : ""} selected ·
                    Click any numeric cell for column summary statistics
                  </span>
                )}
              </footer>
            </div>
          )}

          {/* TAB 2: CHART VIEW */}
          {activeTab === "chart" && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
              <div className="sandbox-statusbar">
                <div className="sandbox-tablist" role="group" aria-label="Chart type">
                  <button
                    type="button"
                    aria-label="Bar chart"
                    aria-selected={chartType === "bar"}
                    onClick={() => setSelectedChartType("bar")}
                    className="sandbox-tab"
                  >
                    <BarChart2 size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Line chart"
                    aria-selected={chartType === "line"}
                    onClick={() => setSelectedChartType("line")}
                    className="sandbox-tab"
                  >
                    <LineIcon size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Area chart"
                    aria-selected={chartType === "area"}
                    onClick={() => setSelectedChartType("area")}
                    className="sandbox-tab"
                  >
                    <AreaIcon size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Pie chart"
                    aria-selected={chartType === "pie"}
                    onClick={() => setSelectedChartType("pie")}
                    className="sandbox-tab"
                  >
                    <PieIcon size={15} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label htmlFor="sandbox-metric-select">Metric:</label>
                  <select
                    id="sandbox-metric-select"
                    value={yKey}
                    onChange={(e) => setOverrideYKey(e.target.value)}
                    className="dataset-chip"
                  >
                    {numericColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ height: "300px", width: "100%", paddingTop: "1rem" }}>
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
                          borderRadius: "4px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey={yKey} fill={GOLD} radius={[3, 3, 0, 0]} />
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
                          borderRadius: "4px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={GOLD}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: GOLD }}
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
                          borderRadius: "4px",
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
                        {parsedData.rows.map((_, index) => (
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
                          borderRadius: "4px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>

              <p className="sandbox-breadcrumb" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                Plotting <strong style={{ color: "var(--gold)" }}>{yKey}</strong> by{" "}
                <strong style={{ color: "var(--gold)" }}>{xKey}</strong>
              </p>
            </div>
          )}

          {/* TAB 3: SIDEKICK */}
          {activeTab === "ai" && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
              <div style={{ maxHeight: "340px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {chatMessages.map((msg, idx) => (
                  <article key={idx} className="curator-note">
                    <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span className="eyebrow">{msg.role === "assistant" ? "Sidekick" : "You"}</span>
                      <time className="preset-btn__meta">{msg.time}</time>
                    </header>
                    <p style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>{msg.content}</p>
                  </article>
                ))}

                {isAiThinking && <div className="sandbox-statusbar">Reading rows...</div>}
              </div>

              <form onSubmit={handleSendCustomPrompt} style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <input
                  type="text"
                  aria-label="Ask a question about this dataset"
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  placeholder="Ask a question about this dataset..."
                  style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "var(--radius)", background: "var(--surface-elevated)", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--foreground)" }}
                />
                <Button type="submit" size="sm" aria-label="Send prompt" className="btn-editorial">
                  <Send size={14} aria-hidden="true" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: SAMPLE INQUIRIES & CURATOR NOTE */}
        <aside className="sandbox-sidebar" aria-label="Sample inquiries and curator note">
          <div>
            <p className="eyebrow">Sample Inquiries</p>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.2rem" }}>Questions for this dataset</h3>
            <p className="sandbox-breadcrumb" style={{ marginBlock: "0.5rem 1rem" }}>
              Select a prompt below to preview how the sidekick summarizes metrics and compares rows.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {activePreset.prompts.map((p, idx) => {
                const isActive = activePromptIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleRunPresetPrompt(idx)}
                    className="inquiry-card"
                  >
                    <div>
                      <strong style={{ display: "block", color: "var(--foreground)", marginBottom: "0.2rem" }}>
                        {p.title}
                      </strong>
                      <span className="preset-btn__meta">{p.prompt}</span>
                    </div>
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <figure className="curator-note">
            <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow">Curator Note</span>
              <span className="preset-btn__meta">{activePreset.name}</span>
            </figcaption>
            <blockquote>
              {activePreset.prompts[activePromptIndex]?.response.replace(/\*\*/g, "")}
            </blockquote>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    activePreset.prompts[activePromptIndex]?.response || ""
                  );
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="dataset-chip"
              >
                {copiedCode ? (
                  <>
                    <Check size={12} aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} aria-hidden="true" />
                    <span>Copy note</span>
                  </>
                )}
              </button>
            </div>
          </figure>
        </aside>
      </div>
    </section>
  );
}
