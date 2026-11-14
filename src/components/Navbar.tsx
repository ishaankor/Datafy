import { Link, useLocation } from "@tanstack/react-router";
import { UserMenu } from "@/components/UserMenu";
import { AuthModal } from "@/components/AuthModal";
import { DatasetHistoryDrawer } from "@/components/DatasetHistoryDrawer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";
import { ArrowUpRight } from "lucide-react";

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
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand-group">
          <Link to="/" className="brand-mark">
            Datafy<span className="brand-mark__dot">.</span>
          </Link>

          <nav className="primary-nav" aria-label="Main navigation">
            <Link
              to="/"
              className="primary-nav__link"
              aria-current={isActive("/") ? "page" : undefined}
            >
              Overview
            </Link>
            <Link
              to="/about"
              className="primary-nav__link"
              aria-current={isActive("/about") ? "page" : undefined}
            >
              About
            </Link>
          </nav>
        </div>

        <div className="site-header__actions">
          {location.pathname !== "/workspace" && (
            <Link to="/workspace" className="btn-editorial">
              <span>Workspace</span>
              <ArrowUpRight size={14} aria-hidden="true" />
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
          window.location.href = "/workspace";
        }}
      />
    </header>
  );
}
