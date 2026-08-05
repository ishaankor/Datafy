import { Link } from "@tanstack/react-router";
import { Sparkles, Github, Twitter, Database, Shield, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-card/40 border-t border-border/60 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* BRAND COL */}
        <div className="space-y-3 md:col-span-1">
          <Link to="/" className="inline-block">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Datafy<span className="text-gold">.</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An editorial data canvas designed for deep research, automated visualization, and
            intelligent AI curating.
          </p>
          <div className="flex items-center gap-3 pt-2 text-muted-foreground">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* NAVIGATION COL */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
            Platform
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-gold transition-colors">
                Home Page
              </Link>
            </li>
            <li>
              <Link to="/workspace" className="hover:text-gold transition-colors">
                Workspace Canvas
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold transition-colors">
                Editorial Philosophy
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-gold transition-colors">
                User Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* TECH STACK COL */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
            Powered By
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-gold" /> Cloudflare Workers Edge
            </li>
            <li className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-gold" /> Supabase Storage & Postgres
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold" /> TanStack Start SSR
            </li>
            <li className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-gold" /> Row-Level Security (RLS)
            </li>
          </ul>
        </div>

        {/* PHILOSOPHY COL */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
            Curator's Note
          </h4>
          <p className="text-xs text-muted-foreground italic font-serif leading-relaxed">
            "Data without context is noise. Datafy transforms raw rows into an interactive,
            beautifully curated reading experience."
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground font-mono">
        <p>© {new Date().getFullYear()} Datafy Inc. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Built with precision for researchers, analysts, & creators.</p>
      </div>
    </footer>
  );
}
