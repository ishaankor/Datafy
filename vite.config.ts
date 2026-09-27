// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
const githubRepoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

const defaultSupabaseUrl = "https://ihzqkqwodhvvetydwivi.supabase.co";
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloenFrcXdvZGh2dmV0eWR3aXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MzUxNzUsImV4cCI6MjEwMTExMTE3NX0.TyET-fgLyjt2PonmMmsrT7exaKA97WjRUzFRmJBseoY";

export default defineConfig({
  vite: {
    base: githubRepoName ? `/${githubRepoName}/` : "/",
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env.VITE_SUPABASE_URL || defaultSupabaseUrl
      ),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey
      ),
    },
  },
  tanstackStart: {
    router: {
      basepath: githubRepoName ? `/${githubRepoName}/` : "/",
    },
    server: { entry: "server" },
  },
});
