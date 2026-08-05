import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Database, ShieldCheck, Cpu, Feather, ArrowRight, Layers } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="min-h-screen bg-background text-foreground animate-fade-in py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-6">
          <span className="text-xs uppercase tracking-widest font-mono text-gold px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
            Editorial Philosophy & Architecture
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Treating Data Like Literature<span className="text-gold">.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-serif">
            Datafy was built on a simple premise: spreadsheets should not feel like tedious admin
            panels. They should read like beautifully curated editorial publications.
          </p>
        </section>

        {/* THREE CORE PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card/40 border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">Editorial Aesthetics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated serif typography, dark gold accents, and fluid layout math that make deep
              research visually engaging.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/40 border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">AI Curator Sidekick</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An inline AI analyst that automatically aggregates cell selections, computes
              distributions, and renders charts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/40 border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">Edge Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deployed on Cloudflare Workers edge runtime with PostgreSQL Row Level Security (RLS)
              via Supabase.
            </p>
          </div>
        </section>

        {/* TECHNICAL ARCHITECTURE */}
        <section className="p-8 rounded-2xl bg-card/30 border border-border/80 space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold" />
            <h2 className="font-display text-2xl font-bold">System Architecture</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
              <span className="font-mono text-gold font-semibold">01. Frontend Runtime</span>
              <p className="text-muted-foreground">
                TanStack Start SSR + React 19 + TailwindCSS + Recharts for 60fps chart rendering.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
              <span className="font-mono text-gold font-semibold">02. Edge Infrastructure</span>
              <p className="text-muted-foreground">
                Cloudflare Workers globally distributed edge network with zero cold-starts.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
              <span className="font-mono text-gold font-semibold">03. Persistence Layer</span>
              <p className="text-muted-foreground">
                Supabase PostgreSQL with RLS policies ensuring isolated user dataset workspaces.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
              <span className="font-mono text-gold font-semibold">04. AI Sidekick Brain</span>
              <p className="text-muted-foreground">
                Vercel AI SDK + Google Gemini & Groq LLMs connected for instant analytical
                responses.
              </p>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="text-center p-10 rounded-2xl bg-gradient-to-b from-card to-background border border-gold/30 space-y-4">
          <h2 className="font-display text-3xl font-bold">Ready to curate your data?</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Upload any CSV file or paste tabular data to launch your interactive editorial canvas.
          </p>
          <Link to="/workspace">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-soft text-ink font-medium px-6 text-xs rounded-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Launch Workspace{" "}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </main>
  );
}
