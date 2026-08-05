import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { fetchUserDatasets, deleteUserDataset, type SavedDataset } from "@/lib/supabase";
import { toast } from "sonner";
import { Database, Trash2, Calendar, FileSpreadsheet, Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DatasetHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDataset: (csvContent: string, datasetName: string, datasetId: string) => void;
}

export function DatasetHistoryDrawer({
  open,
  onOpenChange,
  onSelectDataset,
}: DatasetHistoryDrawerProps) {
  const [datasets, setDatasets] = useState<SavedDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchUserDatasets();
      setDatasets(data);
    } catch {
      toast.error("Failed to load saved datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    const success = await deleteUserDataset(id);
    setDeletingId(null);
    if (success) {
      toast.success("Dataset deleted.");
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } else {
      toast.error("Could not delete dataset.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-background border-border text-foreground p-6 overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-gold" /> My Workspace Datasets
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Continue working on your previously saved datasets and AI sidekick threads.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span className="text-xs">Loading datasets...</span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg p-6 my-4">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No saved datasets yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload or paste a dataset while signed in to auto-save your workspace sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {datasets.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectDataset(item.csv_content, item.name, item.id);
                  onOpenChange(false);
                  toast.success(`Loaded dataset: ${item.name}`);
                }}
                className="group p-4 rounded-lg border border-border bg-card/40 hover:bg-card hover:border-gold/50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm group-hover:text-gold transition-colors flex items-center gap-1.5">
                      {item.name}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {item.row_count} rows × {item.col_count} columns
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deletingId === item.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                  <span className="font-mono text-gold/80">Saved Session</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
