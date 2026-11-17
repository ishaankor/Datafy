import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  MousePointerClick,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Play,
  Pause,
  Sparkles,
} from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";

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
    badge: "01 / INGEST",
    title: "Drop or Paste Raw Tables",
    subtitle: "Immediate in-browser parsing and column typing.",
    icon: FileSpreadsheet,
    description:
      "Bring any raw `.csv` file or tab-delimited selection. Headers are extracted automatically, numeric and categorical columns are identified, and missing values are normalized before rendering.",
    keyPoints: [
      "Client-side CSV and TSV parsing",
      "Automatic numeric, text, and date column detection",
      "Summary statistics computed per column on load",
    ],
    codeSnippet: `Columns detected: 5 (Country, GDP_Billions, Growth_Rate, Tech_Index, RD_Percent)
Rows parsed:      6 records · 0 missing values`,
    previewWidget: "ingest",
  },
  {
    id: 2,
    badge: "02 / ISOLATE",
    title: "Select Spatial Context",
    subtitle: "Scope your analysis to specific cells, rows, or columns.",
    icon: MousePointerClick,
    description:
      "Instead of dumping an entire spreadsheet into a prompt, drag across specific cells or click row and column headers. The selection bar calculates live aggregates and scopes your next question to that exact slice.",
    keyPoints: [
      "Click-and-drag across cells, rows, or columns",
      "Live count, sum, mean, min, and max in the toolbar",
      "Passes only the relevant slice when you ask a question",
    ],
    codeSnippet: `Selection: 2 rows · 2 columns (Country, Growth_Rate)
n=2  |  Σ 12.4  |  μ 6.20  |  min 5.2  |  max 7.2`,
    previewWidget: "selection",
  },
  {
    id: 3,
    badge: "03 / INTERROGATE",
    title: "Ask the Sidekick",
    subtitle: "Plain-language questions grounded in your table.",
    icon: MessageSquare,
    description:
      "Open the sidekick panel alongside your grid to ask for comparisons, outlier checks, or written summaries. Because it sees your active selection, answers stay anchored to the numbers in front of you.",
    keyPoints: [
      "Context-aware responses tied to your current selection",
      "Structured tables, bullet breakdowns, and inline charts",
      "Edit and re-run earlier prompts as your exploration evolves",
    ],
    codeSnippet: `Prompt: "Compare the selected growth rates against R&D share."
Context: Rows 2, 5 · Columns: Country, Growth_Rate, RD_Percent`,
    previewWidget: "ai",
  },
  {
    id: 4,
    badge: "04 / VISUALIZE",
    title: "Plot & Save Sessions",
    subtitle: "Move from rows to charts and pick up where you left off.",
    icon: BarChart3,
    description:
      "Turn any table selection into a bar, line, area, scatter, or distribution chart—and switch chart types on the fly. When signed in, your datasets and conversation history stay saved in your workspace sidebar.",
    keyPoints: [
      "Switch between bar, line, area, scatter, and pie views",
      "Automatic axis and series selection from table columns",
      "Session history saved per dataset for returning later",
    ],
    codeSnippet: `Chart: Bar  |  X: Country  |  Y: Growth_Rate (%)
Series: 6 records plotted`,
    previewWidget: "recharts",
  },
];

export function HomeGuidedTour() {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [isAutoplaying, setIsAutoplaying] = useState<boolean>(true);
  const [stepProgress, setStepProgress] = useState<number>(0);

  // Widget 1 state (Ingest simulation)
  const [selectedMockFile, setSelectedMockFile] = useState<number>(0);
  const mockFiles = [
    { name: "global_markets_2026.csv", rows: 1240, cols: 8, numeric: 6, delimiter: "Comma (,)" },
    { name: "frontier_ai_evals.tsv", rows: 480, cols: 6, numeric: 5, delimiter: "Tab (\\t)" },
    { name: "saas_retention_cohorts.csv", rows: 890, cols: 9, numeric: 7, delimiter: "Comma (,)" },
  ];

  // Widget 2 state (Spatial Selection simulation)
  const [selectedMockRows, setSelectedMockRows] = useState<number[]>([1, 4]);
  const mockTableData = [
    { country: "United States", gdp: 26854, growth: 2.5 },
    { country: "China", gdp: 17734, growth: 5.2 },
    { country: "Germany", gdp: 4456, growth: 1.3 },
    { country: "Japan", gdp: 4212, growth: 1.9 },
    { country: "India", gdp: 3730, growth: 7.2 },
  ];

  // Widget 3 state (AI Typewriter stream simulation)
  const [streamIndex, setStreamIndex] = useState<number>(0);
  const fullAiResponses = [
    "India leads the selection with 7.2% GDP growth, outpacing mature economies by over 400 basis points while sustaining an 84.1 tech expansion index.",
    "China at $17.7T GDP represents 47% of the selected collective output, maintaining moderate 5.2% acceleration with 2.4% R&D reinvestment.",
  ];
  const [activeAiPrompt, setActiveAiPrompt] = useState<number>(0);

  // Widget 4 state (Chart view simulation)
  const [mockChartMode, setMockChartMode] = useState<"bar" | "line" | "area">("bar");

  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  // Autoplay loop timer
  const STEP_DURATION = 5500; // 5.5s per beat
  useEffect(() => {
    if (!isAutoplaying) {
      setStepProgress(0);
      return;
    }

    const interval = 50;
    const timer = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setActiveStepId((current) => (current >= 4 ? 1 : current + 1));
          return 0;
        }
        return prev + (interval / STEP_DURATION) * 100;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoplaying, activeStepId]);

  // Streaming text effect for Step 3
  useEffect(() => {
    if (activeStepId !== 3) return;
    setStreamIndex(0);
    const targetText = fullAiResponses[activeAiPrompt];
    const streamTimer = setInterval(() => {
      setStreamIndex((prev) => {
        if (prev >= targetText.length) {
          clearInterval(streamTimer);
          return prev;
        }
        return prev + 2;
      });
    }, 24);

    return () => clearInterval(streamTimer);
  }, [activeStepId, activeAiPrompt]);

  // Selection metrics calculation for Step 2
  const selectedRecords = mockTableData.filter((_, idx) => selectedMockRows.includes(idx));
  const selectionCount = selectedRecords.length;
  const selectionSum = selectedRecords.reduce((acc, curr) => acc + curr.gdp, 0);
  const selectionAvgGrowth =
    selectionCount > 0
      ? selectedRecords.reduce((acc, curr) => acc + curr.growth, 0) / selectionCount
      : 0;
  const selectionMaxGrowth =
    selectionCount > 0 ? Math.max(...selectedRecords.map((r) => r.growth)) : 0;

  const toggleMockRow = (idx: number) => {
    setIsAutoplaying(false);
    setSelectedMockRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="editorial-section" aria-labelledby="workflow-heading">
      {/* HEADER & AUTOPLAY CONTROLLER */}
      <header className="section-heading">
        <p className="eyebrow">Interactive Tour</p>
        <h2 id="workflow-heading">How a session unfolds</h2>
        <p>From a raw CSV file to a charted, annotated workspace in four coordinated beats.</p>

        {/* CONTROLLER TOOLBAR */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "1.25rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "var(--radius)",
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsAutoplaying((prev) => !prev);
              setStepProgress(0);
            }}
            className="btn-secondary-editorial"
            style={{ padding: "0.25rem 0.65rem", fontSize: "0.6875rem", gap: "0.35rem" }}
          >
            {isAutoplaying ? (
              <>
                <Pause size={12} aria-hidden="true" />
                <span>Pause Auto-Tour</span>
              </>
            ) : (
              <>
                <Play size={12} aria-hidden="true" />
                <span>Play Auto-Tour</span>
              </>
            )}
          </button>

          <span className="preset-btn__meta" style={{ fontVariantNumeric: "tabular-nums" }}>
            Beat {activeStepId} of 4
          </span>

          <a
            href="#demo"
            className="preset-btn__meta"
            style={{
              color: "var(--gold)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            <span>Live Sandbox ↓</span>
          </a>
        </div>
      </header>

      {/* STEPPER NAV TABS WITH ANIMATED PROGRESS BAR */}
      <div className="workflow-stepper" role="tablist" aria-label="Workflow steps">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === activeStepId;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setIsAutoplaying(false);
                setActiveStepId(s.id);
                setStepProgress(0);
              }}
              className="workflow-step-btn"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="eyebrow">{s.badge}</span>
                <Icon
                  size={15}
                  aria-hidden="true"
                  style={{ color: isActive ? "var(--gold)" : "var(--muted-foreground)" }}
                />
              </div>
              <h3>{s.title}</h3>

              {/* Progress bar inside active step */}
              {isActive && (
                <div className="tour-progress-track">
                  <div
                    className="tour-progress-fill"
                    style={{
                      width: isAutoplaying ? `${stepProgress}%` : "100%",
                      transition: isAutoplaying ? "width 0.05s linear" : "none",
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE STEP CONTENT SHOWCASE */}
      <article className="workflow-panel">
        {/* LEFT: TEXT EXPLANATION & POINTS */}
        <div>
          <header style={{ marginBottom: "1rem" }}>
            <p className="eyebrow">{activeStep.badge}</p>
            <h3 style={{ fontSize: "1.875rem", marginTop: "0.25rem" }}>{activeStep.title}</h3>
            <p className="sandbox-breadcrumb" style={{ marginTop: "0.25rem" }}>
              {activeStep.subtitle}
            </p>
          </header>

          <p className="hero-summary" style={{ fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
            {activeStep.description}
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {activeStep.keyPoints.map((pt, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.6rem",
                  fontSize: "0.75rem",
                }}
              >
                <span className="eyebrow" aria-hidden="true">
                  —
                </span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="sandbox-statusbar">
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                color: "var(--foreground)",
              }}
            >
              {activeStep.codeSnippet}
            </pre>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE DYNAMIC PREVIEW BOX */}
        <aside className="workflow-preview-box" aria-label="Step preview">
          {/* BEAT 1: INGEST PREVIEW */}
          {activeStep.previewWidget === "ingest" && (
            <>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "0.6rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  className="sandbox-breadcrumb"
                  style={{
                    color: "var(--foreground)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <FileSpreadsheet size={14} style={{ color: "var(--gold)" }} />
                  <span>{mockFiles[selectedMockFile].name}</span>
                </span>
                <span className="preset-btn__meta" style={{ color: "var(--gold)" }}>
                  ● Parsed in 12ms
                </span>
              </header>

              <dl
                className="curator-note"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.4rem",
                  }}
                >
                  <dt className="preset-btn__meta">Rows Parsed</dt>
                  <dd>
                    <AnimatedNumber value={mockFiles[selectedMockFile].rows} />
                  </dd>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.4rem",
                  }}
                >
                  <dt className="preset-btn__meta">Columns Detected</dt>
                  <dd>
                    <AnimatedNumber value={mockFiles[selectedMockFile].numeric} /> numeric ·{" "}
                    <AnimatedNumber
                      value={
                        mockFiles[selectedMockFile].cols - mockFiles[selectedMockFile].numeric
                      }
                    />{" "}
                    text
                  </dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <dt className="preset-btn__meta">Delimiter Syntax</dt>
                  <dd>{mockFiles[selectedMockFile].delimiter}</dd>
                </div>
              </dl>

              {/* Sample file toggles */}
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {mockFiles.map((f, i) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => {
                      setIsAutoplaying(false);
                      setSelectedMockFile(i);
                    }}
                    className="dataset-chip"
                    style={{
                      borderColor: selectedMockFile === i ? "var(--gold)" : undefined,
                      color: selectedMockFile === i ? "var(--gold)" : undefined,
                    }}
                  >
                    File {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* BEAT 2: SPATIAL SELECTION PREVIEW */}
          {activeStep.previewWidget === "selection" && (
            <>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "0.6rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  className="sandbox-breadcrumb"
                  style={{
                    color: "var(--foreground)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <MousePointerClick size={14} style={{ color: "var(--gold)" }} />
                  <span>Click Rows to Isolate</span>
                </span>
                <span className="eyebrow" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber value={selectionCount} /> rows selected
                </span>
              </header>

              {/* Clickable mini rows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                }}
              >
                {mockTableData.map((row, idx) => {
                  const isSelected = selectedMockRows.includes(idx);
                  return (
                    <div
                      key={row.country}
                      onClick={() => toggleMockRow(idx)}
                      style={{
                        padding: "0.45rem 0.65rem",
                        borderRadius: "var(--radius)",
                        border: isSelected
                          ? "1px solid var(--border-gold-muted)"
                          : "1px solid var(--border-subtle)",
                        backgroundColor: isSelected
                          ? "oklch(0.78 0.13 80 / 0.12)"
                          : "var(--surface-glass)",
                        color: isSelected ? "var(--foreground)" : "var(--muted-foreground)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: isSelected ? "var(--gold)" : "var(--border)",
                          }}
                        />
                        <span>{row.country}</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <span>${row.gdp.toLocaleString()}B</span>
                        <strong style={{ color: isSelected ? "var(--gold)" : "inherit" }}>
                          {row.growth}%
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Animated Status Bar */}
              <footer className="sandbox-statusbar" style={{ fontVariantNumeric: "tabular-nums" }}>
                <span>
                  n=<AnimatedNumber value={selectionCount} />
                </span>
                <span>
                  Σ $<AnimatedNumber value={selectionSum} />B
                </span>
                <span>
                  μ <AnimatedNumber value={selectionAvgGrowth} decimals={2} />%
                </span>
                <span>
                  max <AnimatedNumber value={selectionMaxGrowth} decimals={1} />%
                </span>
              </footer>
            </>
          )}

          {/* BEAT 3: INTERROGATE / STREAMING AI PREVIEW */}
          {activeStep.previewWidget === "ai" && (
            <>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "0.6rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sparkles size={12} style={{ color: "var(--gold)" }} />
                  <span>Grounding: 2 Rows Selected</span>
                </span>
                <span className="preset-btn__meta">Streaming</span>
              </header>

              <div className="curator-note">
                <strong
                  style={{
                    color: "var(--gold)",
                    fontSize: "0.75rem",
                    display: "block",
                    marginBottom: "0.35rem",
                  }}
                >
                  Prompt: "Analyze the top growth drivers in current selection"
                </strong>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                    minHeight: "4rem",
                  }}
                >
                  {fullAiResponses[activeAiPrompt].slice(0, streamIndex)}
                  {streamIndex < fullAiResponses[activeAiPrompt].length && (
                    <span className="streaming-cursor" />
                  )}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoplaying(false);
                    setActiveAiPrompt((prev) => (prev === 0 ? 1 : 0));
                  }}
                  className="dataset-chip"
                >
                  Regenerate query
                </button>

                <a href="#demo" className="btn-editorial" style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}>
                  <span>Try in Sandbox</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </a>
              </div>
            </>
          )}

          {/* BEAT 4: VISUALIZE / RECHARTS PREVIEW */}
          {activeStep.previewWidget === "recharts" && (
            <>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "0.6rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  className="sandbox-breadcrumb"
                  style={{
                    color: "var(--foreground)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <BarChart3 size={14} style={{ color: "var(--gold)" }} />
                  <span>Growth_Rate by Economy</span>
                </span>

                {/* Chart type switcher buttons */}
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {(["bar", "line", "area"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setIsAutoplaying(false);
                        setMockChartMode(m);
                      }}
                      className="dataset-chip"
                      style={{
                        padding: "0.2rem 0.5rem",
                        fontSize: "0.625rem",
                        borderColor: mockChartMode === m ? "var(--gold)" : undefined,
                        color: mockChartMode === m ? "var(--gold)" : undefined,
                      }}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </header>

              {/* Dynamic Interactive SVG Chart Preview */}
              <div
                style={{
                  height: "10rem",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  padding: "1rem 1rem 0",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--surface-subtle)",
                  borderRadius: "var(--radius)",
                }}
              >
                {mockChartMode === "bar" && (
                  <>
                    <div style={{ width: "18%", height: "35%", background: "oklch(0.78 0.13 80 / 0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem", transition: "height 0.4s ease" }}>
                      2.5%
                    </div>
                    <div style={{ width: "18%", height: "72%", background: "oklch(0.78 0.13 80 / 0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem", transition: "height 0.4s ease" }}>
                      5.2%
                    </div>
                    <div style={{ width: "18%", height: "20%", background: "oklch(0.78 0.13 80 / 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem", transition: "height 0.4s ease" }}>
                      1.3%
                    </div>
                    <div style={{ width: "18%", height: "100%", background: "var(--gold)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 700, transition: "height 0.4s ease" }}>
                      7.2%
                    </div>
                    <div style={{ width: "18%", height: "15%", background: "oklch(0.78 0.13 80 / 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem", transition: "height 0.4s ease" }}>
                      0.5%
                    </div>
                  </>
                )}

                {mockChartMode === "line" && (
                  <svg viewBox="0 0 200 80" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    <polyline
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="2.5"
                      points="15,55 55,25 95,65 135,5 175,70"
                    />
                    <circle cx="15" cy="55" r="4" fill="var(--gold)" />
                    <circle cx="55" cy="25" r="4" fill="var(--gold)" />
                    <circle cx="95" cy="65" r="4" fill="var(--gold)" />
                    <circle cx="135" cy="5" r="5" fill="#fff" stroke="var(--gold)" strokeWidth="2" />
                    <circle cx="175" cy="70" r="4" fill="var(--gold)" />
                  </svg>
                )}

                {mockChartMode === "area" && (
                  <svg viewBox="0 0 200 80" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    <defs>
                      <linearGradient id="tourAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#tourAreaGrad)"
                      points="15,80 15,55 55,25 95,65 135,5 175,70 175,80"
                    />
                    <polyline
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="2"
                      points="15,55 55,25 95,65 135,5 175,70"
                    />
                  </svg>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                <span className="preset-btn__meta">Instant inline SVG rendering</span>
                <a href="#demo" className="preset-btn__meta" style={{ color: "var(--gold)" }}>
                  Test with all 5 models ↓
                </a>
              </div>
            </>
          )}
        </aside>
      </article>
    </section>
  );
}
