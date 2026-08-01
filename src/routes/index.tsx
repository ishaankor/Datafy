import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, RotateCcw } from "lucide-react";
import { DataInput } from "@/components/DataInput";
import {
  DataTable,
  emptySelection,
  selectionToCSV,
  selectionLabel,
  type Selection,
} from "@/components/DataTable";
import { AIChat } from "@/components/AIChat";
import { UserMenu } from "@/components/UserMenu";
import { AuthModal } from "@/components/AuthModal";
import { DatasetHistoryDrawer } from "@/components/DatasetHistoryDrawer";
import { parseCSV, datasetSummary } from "@/lib/dataset";
import { supabase, saveDatasetToSupabase } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [csv, setCsv] = useState<string | null>(null);
  const [name, setName] = useState("Untitled");
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [selection, setSelection] = useState<Selection>(emptySelection());
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Auth & Session State
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // Get current user session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const dataset = useMemo(() => {
    if (!csv) return null;
    try {
      return parseCSV(csv);
    } catch {
      toast.error("Could not parse CSV. Check the format.");
      return null;
    }
  }, [csv]);

  const handleDatasetLoad = async (text: string, datasetName: string, loadedDatasetId?: string) => {
    setCsv(text);
    setName(datasetName);
    setSelection(emptySelection());

    if (loadedDatasetId) {
      setActiveDatasetId(loadedDatasetId);
      return;
    }

    // Auto-save to Supabase if logged in
    if (user && supabase) {
      try {
        const parsed = parseCSV(text);
        const saved = await saveDatasetToSupabase(
          datasetName,
          text,
          parsed.rows.length,
          parsed.columns.length,
        );
        if (saved) {
          setActiveDatasetId(saved.id);
          toast.success("Dataset saved to your account!");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }
  };

  const datasetContext = useMemo(
    () => (dataset ? datasetSummary(dataset) : ""),
    [dataset],
  );

  const selCSV = useMemo(
    () => (dataset ? selectionToCSV(dataset, selection) : ""),
    [dataset, selection],
  );

  const selLabel = useMemo(() => selectionLabel(selection), [selection]);

  if (!dataset) {
    return (
      <main className="bg-background text-foreground min-h-screen relative">
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <span className="font-display text-xl font-semibold">
            Datafy<span className="text-gold">.</span>
          </span>
          <UserMenu
            user={user}
            onOpenAuth={() => setAuthOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        </header>

        <DataInput onLoad={(text, n) => handleDatasetLoad(text, n)} />

        <AuthModal
          open={authOpen}
          onOpenChange={setAuthOpen}
          onSuccess={() => {
            setHistoryOpen(true);
          }}
        />

        <DatasetHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          onSelectDataset={(text, datasetName, id) => handleDatasetLoad(text, datasetName, id)}
        />
      </main>
    );
  }

  return (
    <main key={name} className="bg-background text-foreground h-screen overflow-hidden animate-fade-in">
      <nav className="bg-background/90 backdrop-blur border-b border-border animate-fade-in" style={{ animationDelay: "80ms", animationFillMode: "backwards" }}>
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-xl font-semibold">
              Datafy<span className="text-gold">.</span>
            </span>
            <span className="hidden md:block text-xs text-muted-foreground font-mono">
              / {name} · {dataset.rows.length} rows × {dataset.columns.length} cols
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCsv(null);
                setActiveDatasetId(null);
                setSelection(emptySelection());
              }}
              className="text-muted-foreground hover:text-gold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> New dataset
            </Button>
            <Button
              onClick={() => setChatOpen((v) => !v)}
              className="bg-gold hover:bg-gold-soft text-ink rounded-sm"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {chatOpen ? "Hide sidekick" : "Open sidekick"}
            </Button>
            <UserMenu
              user={user}
              onOpenAuth={() => setAuthOpen(true)}
              onOpenHistory={() => setHistoryOpen(true)}
            />
          </div>
        </div>
      </nav>

      <div
        className={`animate-fade-in ${chatOpen ? "sm:pr-[460px] transition-[padding] duration-300" : ""}`}
        style={{ animationDelay: "180ms", animationFillMode: "backwards" }}
      >
        <DataTable
          dataset={dataset}
          selection={selection}
          setSelection={setSelection}
          onAsk={(p) => {
            setChatOpen(true);
            setPendingPrompt(p);
          }}
        />
      </div>

      <AIChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        datasetContext={datasetContext}
        selectionCSV={selCSV}
        selectionLabel={selLabel}
        pendingPrompt={pendingPrompt}
        onPromptConsumed={() => setPendingPrompt(null)}
      />

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => {
          setHistoryOpen(true);
        }}
      />

      <DatasetHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectDataset={(text, datasetName, id) => handleDatasetLoad(text, datasetName, id)}
      />
    </main>
  );
}
