import { Link, useLocation } from "@tanstack/react-router";

export function Footer() {
  const location = useLocation();
  if (location.pathname === "/workspace") {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Link to="/" className="brand-mark">
            Datafy<span className="brand-mark__dot">.</span>
          </Link>
          <p className="hero-summary" style={{ fontSize: "0.75rem", marginTop: "0.35rem" }}>
            An editorial workspace for reading, plotting, and interrogating tabular datasets.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer navigation">
          <Link to="/">Overview</Link>
          <Link to="/workspace">Workspace</Link>
          <Link to="/about">About</Link>
          <Link to="/auth">Sign in</Link>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <small>© {new Date().getFullYear()} Datafy</small>
        <small>Tabular analysis &amp; visual curation</small>
      </div>
    </footer>
  );
}
