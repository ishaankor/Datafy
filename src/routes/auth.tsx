import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate({ to: "/workspace" });
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error("Supabase environment variables are missing.");
      return;
    }

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate({ to: "/workspace" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Redirecting to workspace...");
        navigate({ to: "/workspace" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        <div className="p-8 rounded-md bg-card/50 border border-border shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <span className="font-display text-3xl font-medium tracking-tight text-foreground">
              Datafy<span className="text-gold">.</span>
            </span>
            <h2 className="text-base font-medium text-foreground pt-2">
              {tab === "signin" ? "Sign in to your account" : "Create an account"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Access your saved datasets and workspace sessions.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Supabase Config Missing</span>
                Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
              </div>
            </div>
          )}

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-secondary rounded-sm">
              <TabsTrigger
                value="signin"
                className="text-xs rounded-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-xs rounded-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="email-auth-page" className="text-xs text-muted-foreground">
                  Email address
                </Label>
                <Input
                  id="email-auth-page"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 border-border text-xs rounded-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password-auth-page" className="text-xs text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password-auth-page"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-secondary/50 border-border text-xs rounded-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className="w-full bg-gold hover:bg-gold-soft text-ink text-xs font-medium rounded-sm py-2 mt-2 transition-colors"
              >
                {loading
                  ? "Authenticating..."
                  : tab === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
