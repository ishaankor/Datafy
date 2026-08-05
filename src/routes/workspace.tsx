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
import { AIChat, type Message } from "@/components/AIChat";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { AuthModal } from "@/components/AuthModal";
import { DatasetHistoryDrawer } from "@/components/DatasetHistoryDrawer";
import { parseCSV, datasetSummary } from "@/lib/dataset";
import {
  supabase,
  saveDatasetToSupabase,
  getOrCreateChatSession,
  createNewChatSession,
  fetchSessionMessages,
  type SavedDataset,
} from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useNavigate } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/workspace")({
  component: Workspace,
});

function Workspace() {
  const navigate = useNavigate();
  const [csv, setCsv] = useState<string | null>(null);
  const [name, setName] = useState("Untitled");
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selection, setSelection] = useState<Selection>(emptySelection());
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Auth & Modal State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
      if (!data.user) {
        navigate({ to: "/auth" });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate({ to: "/auth" });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    try {
      const demoCsv = sessionStorage.getItem("datafy_demo_csv");
      const demoName = sessionStorage.getItem("datafy_demo_name");
      if (demoCsv) {
        setCsv(demoCsv);
        if (demoName) setName(demoName);
        sessionStorage.removeItem("datafy_demo_csv");
        sessionStorage.removeItem("datafy_demo_name");
        toast.success(`Loaded demo dataset: ${demoName || "Sample CSV"}`);
      }
    } catch {
      // ignore
    }
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

  const loadSessionChatHistory = async (datasetId: string, datasetName: string) => {
    try {
      const session = await getOrCreateChatSession(datasetId, datasetName);
      if (session) {
        setActiveSessionId(session.id);
        const history = await fetchSessionMessages(session.id);
        const formatted: Message[] = history.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        setSessionMessages(formatted);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const handleDatasetLoad = async (text: string, datasetName: string, loadedDatasetId?: string) => {
    setCsv(text);
    setName(datasetName);
    setSelection(emptySelection());

    let dsId = loadedDatasetId;

    if (loadedDatasetId) {
      setActiveDatasetId(loadedDatasetId);
    } else if (supabase) {
      try {
        const currentUser = user || (await supabase.auth.getUser()).data?.user;
        if (currentUser) {
          const parsed = parseCSV(text);
          const saved = await saveDatasetToSupabase(
            datasetName,
            text,
            parsed.rows.length,
            parsed.columns.length,
          );
          if (saved) {
            dsId = saved.id;
            setActiveDatasetId(saved.id);
            toast.success("Dataset session saved to your account!");
          }
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }

    if (dsId) {
      await loadSessionChatHistory(dsId, datasetName);
    } else {
      setSessionMessages([]);
    }
  };

  const handleSidebarSelectDataset = async (saved: SavedDataset) => {
    setCsv(saved.csv_content);
    setName(saved.name);
    setActiveDatasetId(saved.id);
    setSelection(emptySelection());
    await loadSessionChatHistory(saved.id, saved.name);
    toast.success(`Loaded dataset: ${saved.name}`);
  };

  const handleNewSession = () => {
    setCsv(null);
    setName("Untitled");
    setActiveDatasetId(null);
    setActiveSessionId(null);
    setSessionMessages([]);
    setSelection(emptySelection());
    toast.info("Upload or select a new dataset file.");
  };

  const datasetContext = useMemo(() => (dataset ? datasetSummary(dataset) : ""), [dataset]);

  const selCSV = useMemo(
    () => (dataset ? selectionToCSV(dataset, selection) : ""),
    [dataset, selection],
  );

  const selLabel = useMemo(() => selectionLabel(selection), [selection]);

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-gold font-mono text-xs animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Verifying authentication...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-6 py-12">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card/60 border border-border shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Authentication Required
            </h2>
            <p className="text-xs text-muted-foreground font-serif leading-relaxed">
              To upload datasets, access saved AI sessions, and interact with the editorial canvas,
              please sign in or create an account.
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/auth" })}
            className="w-full bg-gold hover:bg-gold-soft text-ink font-medium text-xs py-2.5 rounded-md shadow-sm"
          >
            Sign In or Create Account
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">
      {/* CHATGPT-STYLE SIDEBAR (WHEN SIGNED IN) */}
      {user && (
        <WorkspaceSidebar
          user={user}
          activeDatasetId={activeDatasetId}
          onSelectDataset={handleSidebarSelectDataset}
          onNewSession={handleNewSession}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden relative">
        {!dataset ? (
          <div className="flex-1 overflow-y-auto">
            <DataInput onLoad={(text, n) => handleDatasetLoad(text, n)} />
          </div>
        ) : (
          <div key={name} className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
            <nav className="bg-background/90 backdrop-blur border-b border-border">
              <div className="px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono">
                    / {name} · {dataset.rows.length} rows × {dataset.columns.length} cols
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewSession}
                    className="text-xs text-muted-foreground hover:text-gold"
                    title="Upload or switch to a new dataset file"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New dataset
                  </Button>
                  <Button
                    onClick={() => setChatOpen((v) => !v)}
                    className="bg-gold hover:bg-gold-soft text-ink rounded-sm text-xs font-medium"
                    size="sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    {chatOpen ? "Hide sidekick" : "Open sidekick"}
                  </Button>
                </div>
              </div>
            </nav>

            <div
              className={`flex-1 overflow-hidden animate-fade-in ${
                chatOpen ? "sm:pr-[460px] transition-[padding] duration-300" : ""
              }`}
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
              sessionId={activeSessionId}
              initialMessages={sessionMessages}
            />
          </div>
        )}
      </main>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <DatasetHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectDataset={(text, datasetName, id) => handleDatasetLoad(text, datasetName, id)}
      />
    </div>
  );
}
