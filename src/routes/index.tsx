import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, RotateCcw } from "lucide-react";
import { DataInput } from "@/components/DataInput";
import { CanvasView } from "@/components/CanvasView";
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
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);

  const dataset = useMemo(() => {
    if (!csv) return null;
    try {
      return parseCSV(csv);
    } catch (e) {
      toast.error("Could not parse CSV. Check the format.");
      return null;
    }
  }, [csv]);

  const datasetContext = useMemo(
    () => (dataset ? datasetSummary(dataset) : ""),
    [dataset],
  );

  if (!dataset) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <DataInput
          onLoad={(text, n) => {
            setCsv(text);
            setName(n);
          }}
        />
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Top bar */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
        <div className="px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-xl">
              Atelier<span className="text-gold">.</span>
            </span>
            <span className="hidden md:block text-xs text-muted-foreground font-mono">
              / {name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCsv(null)}
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
              {chatOpen ? "Close curator" : "Ask the curator"}
            </Button>
          </div>
        </div>
      </nav>

      <div className={chatOpen ? "sm:pr-[420px] transition-[padding] duration-300" : ""}>
        <CanvasView
          dataset={dataset}
          name={name}
          onAsk={(focus) => {
            setPendingFocus(focus);
            setChatOpen(true);
          }}
        />

        <footer className="px-6 md:px-12 py-12 mt-12 border-t border-border">
          <div className="hairline w-24 mb-6" />
          <p className="eyebrow">Colophon</p>
          <p className="font-display text-sm text-muted-foreground mt-2 max-w-md">
            Composed in the Editorial Noir tradition. Words supplied by an AI curator;
            interpretations remain your own.
          </p>
        </footer>
      </div>

      <AIChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        datasetContext={datasetContext}
        pendingFocus={pendingFocus}
        onFocusConsumed={() => setPendingFocus(null)}
      />
    </main>
  );
}
