import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  MousePointerClick,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  ArrowRight,
  Database,
  Cpu,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Step {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: any;
  description: string;
  keyPoints: string[];
  codeSnippet: string;
  previewWidget: "ingest" | "selection" | "ai" | "recharts";
}

const STEPS: Step[] = [
  {
    id: 1,
    badge: "01. INGESTION",
    title: "Instant Raw CSV Parsing",
    subtitle: "Zero server round-trips. Immediate client-side schema inferencing.",
    icon: FileSpreadsheet,
    description:
      "Datafy ingests any raw `.csv` or tab-delimited file instantly in client memory. Headers are automatically parsed, numerical fields are typed, and edge-cases like missing values or formatted currencies are cleaned seamlessly.",
    keyPoints: [
      "Client-side zero-latency Papaparse engine",
      "Automatic data-type coercion (Numeric, Text, Date)",
      "Handles 50,000+ row datasets in milliseconds",
    ],
    codeSnippet: `// Auto-detected schema from dataset
const dataset = parseCSV(rawInput);
// Result: 6 Columns, 250 Rows
// Types: { Country: "string", GDP: "number", TechIndex: "number" }`,
    previewWidget: "ingest",
  },
  {
    id: 2,
    badge: "02. SPATIAL CONTEXT",
    title: "Precision Cell & Sub-Grid Selection",
    subtitle: "Focus AI analysis on exact cells, rows, or highlighted ranges.",
    icon: MousePointerClick,
    description:
      "Unlike generic chat tools that dump entire raw files into context windows, Datafy lets you highlight specific rows or range matrices. Only relevant data is formatted into spatial context tags for the LLM.",
    keyPoints: [
      "Click-to-highlight rows, columns, or cell matrices",
      "Real-time statistical summaries (Sum, Mean, Min, Max)",
      "Reduces LLM context noise for 10x higher precision",
    ],
    codeSnippet: `// Selected Context Range: Rows 1-3, Col "Growth_Rate"
SpatialContext = {
  selectionLabel: "India, China (Growth_Rate)",
  values: [7.2, 5.2],
  aggregateAvg: 6.2
}`,
    previewWidget: "selection",
  },
  {
    id: 3,
    badge: "03. CURATOR SYNTHESIS",
    title: "Editorial AI Data Curator",
    subtitle: "Proactive reasoning, trend detection, and narrative generation.",
    icon: Sparkles,
    description:
      "The inline Curator Sidekick reads your spatial selection and dataset summary. It generates structured markdown reports, calculates mathematical deltas, and flags hidden anomalies in your metrics.",
    keyPoints: [
      "Powered by frontier AI models (Claude 3.5, Gemini 3.6)",
      "Generates markdown tables, bullet points, and key callouts",
      "Remembers complete conversation history per dataset session",
    ],
    codeSnippet: `Curator Output:
"India exhibits top GDP growth (7.2%), outstripping mature markets.
R&D allocation at 0.7% suggests strong leverage on capital efficiency."`,
    previewWidget: "ai",
  },
  {
    id: 4,
    badge: "04. VISUALIZATION & RLS",
    title: "Instant Recharts & Cloud Sync",
    subtitle: "Transform rows into interactive SVG charts and persist to Postgres RLS.",
    icon: BarChart3,
    description:
      "Visualize your findings with single-click Bar, Line, Area, and Pie charts. When logged in, your dataset sessions, chart state, and curator chats sync safely to PostgreSQL with Row Level Security.",
    keyPoints: [
      "Interactive SVG charting powered by Recharts",
      "PostgreSQL RLS ensures private end-to-end data isolation",
      "One-click session recovery across devices",
    ],
    codeSnippet: `// Visualizer Spec
<Recharts.BarChart data={dataset.rows}>
  <Bar dataKey="Growth_Rate" fill="oklch(0.78 0.13 80)" />
</Recharts.BarChart>`,
    previewWidget: "recharts",
  },
];

export function HomeGuidedTour() {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono tracking-wide">
          <Cpu className="w-3.5 h-3.5" />
          <span>Core Architecture</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          How Datafy Works
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto font-serif">
          From raw CSV paste to editorial insights in four seamless steps.
        </p>
      </div>

      {/* STEPPER NAV TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === activeStepId;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStepId(s.id)}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 relative overflow-hidden ${
                isActive
                  ? "bg-gold/15 border-gold shadow-lg shadow-gold/10 text-foreground"
                  : "bg-card/30 border-border/60 text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-1 bg-gold rounded-t-xl" />
              )}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider text-gold font-bold">
                  {s.badge}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-muted-foreground"}`} />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground leading-tight">
                {s.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* ACTIVE STEP CONTENT SHOWCASE */}
      <div className="max-w-5xl mx-auto rounded-2xl bg-card/40 border border-border p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: TEXT EXPLANATION & POINTS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-gold px-2.5 py-1 rounded bg-gold/10 border border-gold/20">
                {activeStep.badge}
              </span>
              <h3 className="font-display text-3xl font-bold text-foreground">
                {activeStep.title}
              </h3>
              <p className="text-xs text-gold font-mono">{activeStep.subtitle}</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed font-serif">
              {activeStep.description}
            </p>

            {/* KEY POINTS LIST */}
            <div className="space-y-2.5 pt-2">
              {activeStep.keyPoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* CODE / SPEC PREVIEW */}
            <div className="pt-2">
              <div className="p-3.5 rounded-lg bg-background border border-border font-mono text-[11px] text-muted-foreground space-y-1 overflow-x-auto">
                <div className="text-[10px] text-gold font-semibold uppercase tracking-wider pb-1 border-b border-border/40">
                  System Architecture Spec
                </div>
                <pre className="text-foreground/80 leading-relaxed">{activeStep.codeSnippet}</pre>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE MINI-WIDGET PREVIEW */}
          <div className="lg:col-span-5 rounded-xl bg-background border border-gold/30 p-5 space-y-4 shadow-xl flex flex-col justify-between min-h-[340px]">
            {activeStep.previewWidget === "ingest" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                  <span className="font-mono text-gold flex items-center gap-1.5 font-semibold">
                    <FileSpreadsheet className="w-4 h-4" /> CSV Ingestion Engine
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Status: Active</span>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-card/60 border border-border font-mono text-xs text-muted-foreground">
                  <div className="text-foreground font-semibold flex justify-between">
                    <span>Parsed Dataset:</span>
                    <span className="text-gold">global_market.csv</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Total Rows:</span>
                    <span>1,240 Rows</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Detected Columns:</span>
                    <span>12 Numeric, 4 Text</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Parse Time:</span>
                    <span className="text-gold font-semibold">0.4ms (Client-Side)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gold/10 border border-gold/30 text-xs text-gold space-y-1">
                  <p className="font-semibold text-foreground font-mono text-[11px]">
                    Zero-Server Data Privacy
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Your raw CSV data stays inside browser memory until you choose to ask the AI
                    Sidekick.
                  </p>
                </div>
              </div>
            )}

            {activeStep.previewWidget === "selection" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                  <span className="font-mono text-gold flex items-center gap-1.5 font-semibold">
                    <MousePointerClick className="w-4 h-4" /> Spatial Matrix Focus
                  </span>
                  <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded font-mono">
                    3 Rows Highlighted
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-card/80 border border-gold/40 text-xs font-mono space-y-2">
                  <div className="text-[11px] text-muted-foreground">Selected Cells Matrix:</div>
                  <div className="p-2 rounded bg-background border border-border text-gold font-semibold text-xs">
                    Row 5: India → GDP: $3,730B | Growth: 7.2%
                  </div>
                  <div className="p-2 rounded bg-background border border-border text-foreground/80 text-xs">
                    Row 2: China → GDP: $17,734B | Growth: 5.2%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-card/40 border border-border text-[11px] font-mono text-muted-foreground space-y-1">
                  <div className="text-foreground font-semibold">Aggregated Context Payload:</div>
                  <div>Average Growth: <span className="text-gold font-bold">6.2%</span></div>
                  <div>Combined GDP: <span className="text-gold font-bold">$21,464 Billion</span></div>
                </div>
              </div>
            )}

            {activeStep.previewWidget === "ai" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                  <span className="font-mono text-gold flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-4 h-4" /> Curator Reasoning Output
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">Model: Gemini 3.6</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gold/10 border border-gold/30 text-xs text-foreground space-y-2 font-serif leading-relaxed">
                  <p className="font-sans font-semibold text-gold text-xs">
                    Editorial Breakdown:
                  </p>
                  <p>
                    "Comparing growth vs tech density reveals an inverse curve: India delivers top expansion (7.2%) but holds room for digital index progression."
                  </p>
                </div>

                <Link to="/workspace">
                  <Button size="sm" className="w-full bg-gold hover:bg-gold-soft text-ink text-xs font-medium">
                    Try Curator in Workspace <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            )}

            {activeStep.previewWidget === "recharts" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                  <span className="font-mono text-gold flex items-center gap-1.5 font-semibold">
                    <BarChart3 className="w-4 h-4" /> SVG Recharts Engine
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Postgres RLS On</span>
                </div>

                <div className="h-40 w-full flex items-end justify-between gap-2 px-4 pt-4 border border-border rounded-lg bg-card/30">
                  <div className="w-1/5 bg-gold/40 h-[40%] rounded-t flex items-center justify-center text-[10px] font-mono">2.5%</div>
                  <div className="w-1/5 bg-gold/70 h-[70%] rounded-t flex items-center justify-center text-[10px] font-mono">5.2%</div>
                  <div className="w-1/5 bg-gold/30 h-[25%] rounded-t flex items-center justify-center text-[10px] font-mono">1.3%</div>
                  <div className="w-1/5 bg-gold/90 h-[95%] rounded-t flex items-center justify-center text-[10px] font-mono text-ink font-bold">7.2%</div>
                  <div className="w-1/5 bg-gold/20 h-[15%] rounded-t flex items-center justify-center text-[10px] font-mono">0.5%</div>
                </div>

                <div className="text-[11px] text-muted-foreground font-mono text-center">
                  Instant SVG rendering with hover tooltips and PNG export.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
