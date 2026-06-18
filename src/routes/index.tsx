import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { parseCSV, datasetSummary } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [csv, setCsv] = useState<string | null>(null);
  const [name, setName] = useState("Untitled");
  const [chatOpen, setChatOpen] = useState(true);
  const [selection, setSelection] = useState<Selection>(emptySelection());
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const dataset = useMemo(() => {
    if (!csv) return null;
    try {
      return parseCSV(csv);
    } catch {
      toast.error("Could not parse CSV. Check the format.");
      return null;
    }
  }, [csv]);

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
      <main className="bg-background text-foreground min-h-screen">
        <DataInput
          onLoad={(text, n) => {
            setCsv(text);
            setName(n);
            setSelection(emptySelection());
          }}
        />
      </main>
    );
  }

  return (
    <main key={name} className="bg-background text-foreground h-screen overflow-hidden animate-fade-in">
      <nav className="bg-background/90 backdrop-blur border-b border-border animate-fade-in" style={{ animationDelay: "80ms", animationFillMode: "backwards" }}>
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-xl">
              Datafy!<span className="text-gold">.</span>
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
    </main>
  );
}
