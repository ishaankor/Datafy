import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HomeDemo, PRESET_DATASETS, type DemoDataset } from "@/components/HomeDemo";
import { HomeGuidedTour } from "@/components/HomeGuidedTour";
import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  FileSpreadsheet,
  MousePointerClick,
  BookOpen,
  History,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  const handleQuickEnterDataset = (ds: DemoDataset) => {
    try {
      sessionStorage.setItem("datafy_demo_csv", ds.csv);
      sessionStorage.setItem("datafy_demo_name", ds.name);
    } catch {
      // ignore
    }
    navigate({ to: "/workspace" });
  };

  return (
    <main className="editorial-page">
      {/* 1. HERO ENTRANCE SECTION */}
      <section className="hero-entrance" aria-labelledby="hero-title">
        <div className="hero-spotlight" aria-hidden="true" />

        <div className="hero-stage">
          {/* EDITORIAL MASTHEAD BAR */}
          <header className="masthead-bar">
            <div className="masthead-vol">
              <span className="masthead-rule" aria-hidden="true" />
              <p className="eyebrow">Interactive Data Canvas</p>
              <span className="masthead-rule" aria-hidden="true" />
            </div>
          </header>

          {/* HEADLINE & ORNAMENT */}
          <div className="hero-frontispiece">
            <h1 id="hero-title" className="hero-headline">
              Turn raw tables into an <em>editorial canvas.</em>
            </h1>

            <div className="hero-ornament" aria-hidden="true">
              <span className="hero-diamond" />
            </div>

            <p className="hero-summary">
              Drop in a CSV, highlight the rows or columns that matter, plot distributions, and
              interrogate your dataset alongside a context-aware analyst.
            </p>
          </div>

          {/* PRIMARY THRESHOLD CTAS */}
          <div className="hero-actions">
            <Link to="/workspace" className="btn-editorial btn-editorial--lg">
              <span>Enter Workspace</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>

            <a href="#demo" className="btn-secondary-editorial">
              Try Sandbox Below ↓
            </a>
          </div>

          {/* DIRECT DATASET ENTRY THRESHOLD */}
          <nav className="dataset-threshold" aria-label="Sample datasets">
            <span className="dataset-threshold__label">Or open directly with:</span>
            {PRESET_DATASETS.map((ds) => (
              <button
                key={ds.id}
                type="button"
                onClick={() => handleQuickEnterDataset(ds)}
                className="dataset-chip"
              >
                {ds.name} ↗
              </button>
            ))}
            <Link to="/workspace" className="dataset-chip dataset-chip--dashed">
              <Upload size={12} aria-hidden="true" />
              <span>Your CSV</span>
            </Link>
          </nav>

          {/* VERTICAL LEAD-IN STEM */}
          <div className="hero-stem" aria-hidden="true" />

          {/* EDITORIAL SPEC LEDGER */}
          <dl className="spec-ledger" aria-label="Platform specifications">
            <div>
              <span className="eyebrow">01 / Ingest</span>
              <dt>Direct CSV &amp; TSV</dt>
              <dd>Parsed locally with automatic schema and type detection.</dd>
            </div>
            <div>
              <span className="eyebrow">02 / Context</span>
              <dt>Spatial Selection</dt>
              <dd>Isolate specific cells, rows, or columns before querying.</dd>
            </div>
            <div>
              <span className="eyebrow">03 / Graphics</span>
              <dt>Inline Plotting</dt>
              <dd>Bar, line, area, scatter, and distribution charts on demand.</dd>
            </div>
            <div>
              <span className="eyebrow">04 / Continuity</span>
              <dt>Saved Sessions</dt>
              <dd>Datasets and analysis threads persist across visits.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE DEMO SHOWCASE */}
      <HomeDemo />

      <div className="hairline" style={{ maxWidth: "64rem", margin: "3rem auto" }} role="separator" />

      {/* 3. STEP-BY-STEP GUIDED TOUR */}
      <HomeGuidedTour />

      <div className="hairline" style={{ maxWidth: "64rem", margin: "3rem auto" }} role="separator" />

      {/* 4. CAPABILITIES GRID */}
      <section className="editorial-section" aria-labelledby="capabilities-heading">
        <header className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2 id="capabilities-heading">Built for close reading of data</h2>
          <p>
            Tools designed to keep raw numbers, visual plots, and written interpretation in the same
            frame.
          </p>
        </header>

        <div className="capabilities-grid">
          <article className="capability-card">
            <div className="capability-icon" aria-hidden="true">
              <FileSpreadsheet size={16} />
            </div>
            <h3>Local CSV Ingestion</h3>
            <p>
              Drop a <code>.csv</code> file or paste tabular text. Headers, numeric columns, and
              summary counts are inferred immediately in the browser.
            </p>
          </article>

          <article className="capability-card">
            <div className="capability-icon" aria-hidden="true">
              <MousePointerClick size={16} />
            </div>
            <h3>Spatial Context Selection</h3>
            <p>
              Drag across cells or click row and column headers to scope your question. Instant
              aggregates (count, sum, mean, min, max) appear in the toolbar as you select.
            </p>
          </article>

          <article className="capability-card">
            <div className="capability-icon" aria-hidden="true">
              <BarChart3 size={16} />
            </div>
            <h3>Interactive Charts</h3>
            <p>
              Generate bar, line, area, scatter, and pie charts directly from a table selection or
              ask the sidekick to plot a comparison for you.
            </p>
          </article>

          <article className="capability-card">
            <div className="capability-icon" aria-hidden="true">
              <MessageSquare size={16} />
            </div>
            <h3>Inline Analyst Sidekick</h3>
            <p>
              Ask questions in plain language alongside your grid. Receive structured breakdowns,
              outlier checks, and embedded charts without leaving the table.
            </p>
          </article>

          <article className="capability-card">
            <div className="capability-icon" aria-hidden="true">
              <History size={16} />
            </div>
            <h3>Persistent Workspaces</h3>
            <p>
              Sign in to keep your uploaded datasets and conversation threads organized in a
              session history sidebar you can return to anytime.
            </p>
          </article>

          <article className="capability-card">
            <div className="capability-icon" aria-hidden="true">
              <BookOpen size={16} />
            </div>
            <h3>Legible by Default</h3>
            <p>
              High-contrast dark surfaces, tabular numerals, and clear typographic hierarchy keep
              long analysis sessions calm on the eyes.
            </p>
          </article>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION BANNER */}
      <aside className="cta-panel" aria-labelledby="cta-heading">
        <div className="cta-panel__box">
          <p className="eyebrow">Get Started</p>
          <h2 id="cta-heading">Bring your own dataset to the canvas.</h2>
          <p>Open the workspace to upload a CSV file, highlight ranges, and start exploring.</p>
          <Link to="/workspace" className="btn-editorial btn-editorial--lg">
            <span>Open Workspace</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </main>
  );
}
