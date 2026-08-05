import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root route error captured:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-serif leading-relaxed">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>

        {error?.message && (
          <div className="p-3 rounded-lg bg-card/80 border border-destructive/30 text-left space-y-1">
            <p className="text-[10px] font-mono text-destructive font-semibold uppercase tracking-wider">
              Error Details:
            </p>
            <p className="text-[11px] font-mono text-muted-foreground break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              try {
                router.invalidate();
                reset();
              } catch {
                // ignore
              }
              window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-md bg-gold hover:bg-gold-soft text-ink px-5 py-2.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card/60 px-5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-card hover:text-gold"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Datafy! — Editorial data canvas for deep research" },
      {
        name: "description",
        content: "Paste a dataset. Receive an editorial canvas. Ask the curator anything.",
      },
      { property: "og:title", content: "Datafy! — Editorial data canvas" },
      { property: "og:description", content: "An aesthetic, AI-curated way to explore your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
