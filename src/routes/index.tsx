import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HomeDemo } from "@/components/HomeDemo";
import { HomeGuidedTour } from "@/components/HomeGuidedTour";
import {
  Sparkles,
  ArrowRight,
  Database,
  Shield,
  Zap,
  BarChart3,
  MessageCircle,
  FileSpreadsheet,
  CheckCircle2,
  MousePointerClick,
  Layers,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground animate-fade-in space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center space-y-8">
        {/* TOP BADGE */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono tracking-wide shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vol. I — Editorial AI Data Workspace</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* HEADLINE */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.08]">
            Turn raw data into an{" "}
            <span className="text-gold italic font-serif block sm:inline">
              editorial canvas.
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-2xl max-w-2xl mx-auto leading-relaxed font-serif pt-2">
            Upload CSVs, explore interactive grids, render live charts, and research your dataset
            alongside an inline AI Curator Sidekick.
          </p>
        </div>

        {/* HERO CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/workspace">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-soft text-ink font-semibold px-8 py-6 text-sm rounded-md shadow-lg shadow-gold/20 hover:scale-[1.02] transition-all w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Launch Workspace{" "}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <a href="#demo">
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:text-gold hover:border-gold/50 px-6 py-6 text-sm rounded-md w-full sm:w-auto font-mono"
            >
              Explore Live Demo ↓
            </Button>
          </a>
        </div>

        {/* PERFORMANCE METRICS TICKER */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-xl bg-card/30 border border-border/50 backdrop-blur-xs hover:border-gold/40 transition-colors">
            <p className="font-display text-3xl font-bold text-gold">0ms</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">Client Cold-Start</p>
          </div>
          <div className="p-4 rounded-xl bg-card/30 border border-border/50 backdrop-blur-xs hover:border-gold/40 transition-colors">
            <p className="font-display text-3xl font-bold text-gold">100%</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">Postgres RLS Private</p>
          </div>
          <div className="p-4 rounded-xl bg-card/30 border border-border/50 backdrop-blur-xs hover:border-gold/40 transition-colors">
            <p className="font-display text-3xl font-bold text-gold">Instant</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">CSV & Recharts Engine</p>
          </div>
          <div className="p-4 rounded-xl bg-card/30 border border-border/50 backdrop-blur-xs hover:border-gold/40 transition-colors">
            <p className="font-display text-3xl font-bold text-gold">AI</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">Curator Sidekick</p>
          </div>
        </div>
      </section>

      {/* HAIRLINE DIVIDER */}
      <div className="hairline max-w-5xl mx-auto" />

      {/* 2. INTERACTIVE LIVE DEMO SHOWCASE */}
      <section className="px-6 max-w-7xl mx-auto">
        <HomeDemo />
      </section>

      {/* HAIRLINE DIVIDER */}
      <div className="hairline max-w-5xl mx-auto" />

      {/* 3. STEP-BY-STEP GUIDED TOUR */}
      <HomeGuidedTour />

      {/* HAIRLINE DIVIDER */}
      <div className="hairline max-w-5xl mx-auto" />

      {/* 4. FEATURES MATRIX GRID */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono tracking-wide">
            <Layers className="w-3.5 h-3.5" />
            <span>Capability Suite</span>
          </div>
          <h2 className="font-display text-4xl font-bold">Built for Rigorous Research</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto font-serif">
            Everything you need to parse, visualize, and persist data sessions seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-card/30 border border-border/80 space-y-4 hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Instant CSV Ingestion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag and drop any raw `.csv` file or paste tab-delimited text. Auto-detects schema,
              data types, row counts, and numerical columns instantly.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/30 border border-border/80 space-y-4 hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Spatial Context Selection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click individual cells, rows, or columns to isolate context. Datafy builds focused spatial
              payloads so AI responses pinpoint exact metrics without hallucination.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/30 border border-border/80 space-y-4 hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Dynamic Recharts Graphics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Render interactive Bar, Line, Area, and Pie charts directly from table selections or
              AI prompt commands with full SVG tooltip interactivity.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/30 border border-border/80 space-y-4 hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">AI Curator Sidekick</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask questions in natural language. Receive formatted markdown summaries, statistical
              explanations, formula verification, and recommended next steps.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/30 border border-border/80 space-y-4 hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Supabase RLS Persistence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to save your datasets, chat threads, and visualizations safely to your personal
              cloud account powered by PostgreSQL Row Level Security.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/30 border border-border/80 space-y-4 hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Editorial Noir Aesthetics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Crafted with Cormorant Garamond typography, gold foil accents, dark museum contrast,
              and micro-animations for an executive-grade experience.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION BANNER */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-card via-background to-card border border-gold/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Begin</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Experience the Editorial Data Workspace
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-serif">
            No configuration required. Launch the workspace and start exploring your data in
            seconds.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Link to="/workspace">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-soft text-ink font-semibold px-8 text-sm rounded-md shadow-lg shadow-gold/20 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Launch Free Workspace{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
