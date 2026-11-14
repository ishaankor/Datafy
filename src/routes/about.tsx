import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="editorial-page">
      <div className="editorial-section" style={{ maxWidth: "var(--container-reading)" }}>
        {/* HERO HEADER */}
        <header style={{ marginBottom: "3.5rem" }}>
          <p className="eyebrow">Design &amp; Approach</p>
          <h1 className="hero-headline" style={{ fontSize: "clamp(2.25rem, 1.8rem + 2.5vw, 3.75rem)", marginBlock: "0.75rem 1rem" }}>
            Reading data before querying it<span className="brand-mark__dot">.</span>
          </h1>
          <p className="hero-summary" style={{ marginInline: 0 }}>
            Most data tools ask you to choose between a dense spreadsheet grid and a blank chat box.
            Datafy keeps the table, the chart, and the written interpretation side by side—so every
            question stays anchored to the numbers in front of you.
          </p>
        </header>

        <div className="hairline" style={{ marginBottom: "3.5rem" }} role="separator" />

        {/* THREE CORE PILLARS */}
        <section className="capabilities-grid" style={{ marginBottom: "3.5rem" }} aria-label="Core principles">
          <article className="capability-card">
            <p className="eyebrow">01 / Legibility</p>
            <h2 style={{ fontSize: "1.25rem", marginBlock: "0.4rem" }}>Calm Typography</h2>
            <p>
              Tabular numerals, restrained contrast, and clear visual hierarchy keep long sessions
              readable even across wide tables.
            </p>
          </article>

          <article className="capability-card">
            <p className="eyebrow">02 / Precision</p>
            <h2 style={{ fontSize: "1.25rem", marginBlock: "0.4rem" }}>Scoped Context</h2>
            <p>
              Instead of passing an entire file blindly, highlight the exact cells, rows, or columns
              you want summarized or plotted.
            </p>
          </article>

          <article className="capability-card">
            <p className="eyebrow">03 / Continuity</p>
            <h2 style={{ fontSize: "1.25rem", marginBlock: "0.4rem" }}>Saved Sessions</h2>
            <p>
              Uploaded datasets and conversation threads are stored per account so you can revisit
              an analysis where you left off.
            </p>
          </article>
        </section>

        {/* HOW IT FITS TOGETHER */}
        <section className="curator-note" style={{ padding: "2rem", marginBottom: "3.5rem" }} aria-labelledby="architecture-heading">
          <header style={{ marginBottom: "1.5rem" }}>
            <p className="eyebrow">Under the Hood</p>
            <h2 id="architecture-heading" style={{ fontSize: "1.5rem", marginTop: "0.25rem" }}>
              How the workspace operates
            </h2>
          </header>

          <dl className="capabilities-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))" }}>
            <div className="capability-card">
              <dt className="eyebrow">01 / Local Table Engine</dt>
              <dd style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                CSV files are parsed in the browser with automatic column type inference and instant
                selection statistics.
              </dd>
            </div>

            <div className="capability-card">
              <dt className="eyebrow">02 / Spatial Serialization</dt>
              <dd style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                Cell, row, and column selections are serialized into compact sub-tables so the
                sidekick reasons over your active slice.
              </dd>
            </div>

            <div className="capability-card">
              <dt className="eyebrow">03 / Inline Graphics</dt>
              <dd style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                Charts render directly inside the conversation stream and let you switch between
                bar, line, area, scatter, and pie views.
              </dd>
            </div>

            <div className="capability-card">
              <dt className="eyebrow">04 / Account Persistence</dt>
              <dd style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                Datasets and chat threads sync to your account database with row-level isolation
                between users.
              </dd>
            </div>
          </dl>
        </section>

        {/* CTA BANNER */}
        <aside className="cta-panel" style={{ paddingInline: 0 }}>
          <div className="cta-panel__box">
            <h2>Open the workspace</h2>
            <p>
              Upload a CSV file or try one of the sample datasets to explore your numbers on the
              canvas.
            </p>
            <Link to="/workspace" className="btn-editorial btn-editorial--lg">
              <span>Open Workspace</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
