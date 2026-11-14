import { useState } from "react";
import {
  FileSpreadsheet,
  MousePointerClick,
  MessageSquare,
  BarChart3,
  ArrowRight,
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
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <section className="editorial-section" aria-labelledby="workflow-heading">
      {/* HEADER */}
      <header className="section-heading">
        <p className="eyebrow">Workflow</p>
        <h2 id="workflow-heading">How a session unfolds</h2>
        <p>From a raw CSV file to a charted, annotated workspace in four steps.</p>
      </header>

      {/* STEPPER NAV TABS */}
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
              onClick={() => setActiveStepId(s.id)}
              className="workflow-step-btn"
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

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {activeStep.keyPoints.map((pt, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", fontSize: "0.75rem" }}>
                <span className="eyebrow" aria-hidden="true">—</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="sandbox-statusbar">
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5, color: "var(--foreground)" }}>
              {activeStep.codeSnippet}
            </pre>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE MINI-WIDGET PREVIEW */}
        <aside className="workflow-preview-box" aria-label="Step preview">
          {activeStep.previewWidget === "ingest" && (
            <>
              <header style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid var(--border)" }}>
                <span className="sandbox-breadcrumb" style={{ color: "var(--foreground)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <FileSpreadsheet size={14} style={{ color: "var(--gold)" }} />
                  <span>global_market.csv</span>
                </span>
                <span className="preset-btn__meta">Parsed</span>
              </header>

              <dl className="curator-note" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <dt className="preset-btn__meta">Rows</dt>
                  <dd>1,240</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <dt className="preset-btn__meta">Columns</dt>
                  <dd>12 numeric · 4 text</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <dt className="preset-btn__meta">Delimiter</dt>
                  <dd>Comma (,)</dd>
                </div>
              </dl>

              <p className="preset-btn__meta" style={{ lineHeight: 1.5 }}>
                Files are parsed directly in your browser tab so you can inspect and filter rows
                immediately.
              </p>
            </>
          )}

          {activeStep.previewWidget === "selection" && (
            <>
              <header style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid var(--border)" }}>
                <span className="sandbox-breadcrumb" style={{ color: "var(--foreground)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <MousePointerClick size={14} style={{ color: "var(--gold)" }} />
                  <span>Active Selection</span>
                </span>
                <span className="eyebrow">2 rows · 2 cols</span>
              </header>

              <div className="curator-note" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ padding: "0.5rem", border: "1px solid var(--border-gold-muted)", color: "var(--gold)" }}>
                  Row 5 · India — GDP: 3,730 | Growth: 7.2%
                </div>
                <div style={{ padding: "0.5rem", border: "1px solid var(--border)" }}>
                  Row 2 · China — GDP: 17,734 | Growth: 5.2%
                </div>
              </div>

              <footer className="sandbox-statusbar">
                <span>n=2</span>
                <span>Σ 21,464</span>
                <span>μ 6.2% growth</span>
              </footer>
            </>
          )}

          {activeStep.previewWidget === "ai" && (
            <>
              <header style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid var(--border)" }}>
                <span className="eyebrow">Sidekick</span>
                <span className="preset-btn__meta">Working with 2 rows</span>
              </header>

              <div className="curator-note">
                <strong style={{ color: "var(--gold)", fontSize: "0.75rem", display: "block", marginBottom: "0.35rem" }}>
                  Growth vs. R&amp;D Allocation
                </strong>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  India records the highest GDP growth in the sample (7.2%) despite a 0.7% R&amp;D
                  share, whereas mature peers invest over 3% of GDP to sustain frontier tech indices
                  above 89.
                </p>
              </div>

              <Link to="/workspace" className="btn-editorial">
                <span>Open Workspace</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}

          {activeStep.previewWidget === "recharts" && (
            <>
              <header style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid var(--border)" }}>
                <span className="sandbox-breadcrumb" style={{ color: "var(--foreground)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <BarChart3 size={14} style={{ color: "var(--gold)" }} />
                  <span>Growth_Rate by Country</span>
                </span>
                <span className="preset-btn__meta">Bar</span>
              </header>

              <div style={{ height: "10rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.5rem", padding: "1rem 1rem 0", border: "1px solid var(--border-subtle)" }}>
                <div style={{ width: "18%", height: "40%", background: "oklch(0.78 0.13 80 / 0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem" }}>
                  2.5%
                </div>
                <div style={{ width: "18%", height: "70%", background: "oklch(0.78 0.13 80 / 0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem" }}>
                  5.2%
                </div>
                <div style={{ width: "18%", height: "25%", background: "oklch(0.78 0.13 80 / 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem" }}>
                  1.3%
                </div>
                <div style={{ width: "18%", height: "95%", background: "var(--gold)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 600 }}>
                  7.2%
                </div>
                <div style={{ width: "18%", height: "15%", background: "oklch(0.78 0.13 80 / 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.625rem" }}>
                  0.5%
                </div>
              </div>

              <p className="preset-btn__meta" style={{ textAlign: "center" }}>
                Switch between bar, line, area, scatter, and pie views
              </p>
            </>
          )}
        </aside>
      </article>
    </section>
  );
}
