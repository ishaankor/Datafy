import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { LogIn, UserPlus, Sparkles, KeyRound, AlertTriangle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error("Supabase environment variables are missing.", {
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
      });
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
        onOpenChange(false);
        onSuccess?.();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm registration.");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-2xl tracking-tight">
              Datafy<span className="text-gold">.</span>
            </span>
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {tab === "signin" ? "Welcome back" : "Create an account"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in to auto-save your uploaded CSV datasets, sidekick chats, and custom visualizations.
          </DialogDescription>
        </DialogHeader>

        {!isSupabaseConfigured && (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 my-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Supabase Config Required</span>
              Add <code className="bg-background/80 px-1 py-0.5 rounded font-mono text-[10px]">VITE_SUPABASE_URL</code> & <code className="bg-background/80 px-1 py-0.5 rounded font-mono text-[10px]">VITE_SUPABASE_ANON_KEY</code> to your environment variables to enable authentication.
            </div>
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="signin" className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground">
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Sign Up
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleAuth} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="curator@datafy.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-secondary/50 border-border text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-gold hover:bg-gold-soft text-ink text-xs font-medium rounded-sm py-2 mt-2 transition-all"
            >
              {loading ? (
                "Processing..."
              ) : tab === "signin" ? (
                <span className="flex items-center justify-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Sign In to Workspace
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Create Account
                </span>
              )}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
