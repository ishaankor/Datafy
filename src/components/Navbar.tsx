import { Link, useLocation } from "@tanstack/react-router";
import { UserMenu } from "@/components/UserMenu";
import { AuthModal } from "@/components/AuthModal";
import { DatasetHistoryDrawer } from "@/components/DatasetHistoryDrawer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";
import { Sparkles, LayoutDashboard, Info, Home } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-gold transition-colors">
            Datafy<span className="text-gold">.</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 tracking-wider">
            Editorial AI
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-full border border-border/40">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isActive("/")
                ? "bg-card text-gold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <Link
            to="/about"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isActive("/about")
                ? "bg-card text-gold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="w-3.5 h-3.5" /> About
          </Link>
          <Link
            to="/workspace"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isActive("/workspace")
                ? "bg-card text-gold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Workspace
          </Link>
        </nav>

        {/* ACTION BUTTONS & USER MENU */}
        <div className="flex items-center gap-3">
          {location.pathname !== "/workspace" && (
            <Link to="/workspace">
              <Button
                size="sm"
                className="bg-gold hover:bg-gold-soft text-ink text-xs font-medium rounded-md px-4 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Open Workspace
              </Button>
            </Link>
          )}

          <UserMenu
            user={user}
            onOpenAuth={() => setAuthOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <DatasetHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectDataset={() => {
          // Window redirect or navigate to workspace
          window.location.href = "/workspace";
        }}
      />
    </header>
  );
}
