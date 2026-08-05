import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchUserDatasets, deleteUserDataset, type SavedDataset, supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Database,
} from "lucide-react";
import { type User } from "@supabase/supabase-js";
import { isToday, isYesterday } from "date-fns";

interface WorkspaceSidebarProps {
  user: User | null;
  activeDatasetId: string | null;
  onSelectDataset: (dataset: SavedDataset) => void;
  onNewSession: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function WorkspaceSidebar({
  user,
  activeDatasetId,
  onSelectDataset,
  onNewSession,
  collapsed,
  onToggleCollapse,
}: WorkspaceSidebarProps) {
  const [datasets, setDatasets] = useState<SavedDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserDatasets();
      setDatasets(data);
    } catch {
      toast.error("Could not load dataset sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user, activeDatasetId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    const success = await deleteUserDataset(id);
    setDeletingId(null);
    if (success) {
      toast.success("Session deleted.");
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      if (activeDatasetId === id) {
        onNewSession();
      }
    } else {
      toast.error("Could not delete session.");
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully.");
    }
  };

  if (!user) return null;

  // Group datasets by time
  const todayDatasets = datasets.filter((d) => isToday(new Date(d.created_at)));
  const yesterdayDatasets = datasets.filter((d) => isYesterday(new Date(d.created_at)));
  const olderDatasets = datasets.filter(
    (d) => !isToday(new Date(d.created_at)) && !isYesterday(new Date(d.created_at)),
  );

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "US";

  return (
    <aside
      className={`h-[calc(100vh-4rem)] bg-card/60 border-r border-border/60 flex flex-col transition-all duration-300 relative ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* COLLAPSE TOGGLE BUTTON */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-5 z-20 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-gold shadow-md transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* NEW SESSION BUTTON */}
      <div className="p-3 border-b border-border/40">
        <Button
          onClick={onNewSession}
          className={`w-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-md text-xs font-medium transition-all ${
            collapsed ? "px-0 justify-center" : "justify-start px-3"
          }`}
          size="sm"
          title="Upload or select a new dataset file"
        >
          <Plus className="w-4 h-4 shrink-0 text-gold" />
          {!collapsed && <span className="ml-2 font-mono">New Session</span>}
        </Button>
      </div>

      {/* SESSIONS LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 font-sans text-xs">
        {loading && !collapsed && (
          <div className="p-4 text-center text-muted-foreground text-[11px]">
            Loading sessions...
          </div>
        )}

        {!loading && datasets.length === 0 && !collapsed && (
          <div className="p-4 text-center text-muted-foreground text-[11px] space-y-1">
            <MessageSquare className="w-5 h-5 opacity-40 mx-auto mb-1 text-gold" />
            <p className="font-semibold text-foreground">No sessions yet</p>
            <p className="text-[10px]">Upload a CSV to start an AI dataset session.</p>
          </div>
        )}

        {/* TODAY */}
        {todayDatasets.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Today
              </p>
            )}
            {todayDatasets.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeDatasetId === item.id}
                collapsed={collapsed}
                deleting={deletingId === item.id}
                onSelect={() => onSelectDataset(item)}
                onDelete={(e) => handleDelete(item.id, e)}
              />
            ))}
          </div>
        )}

        {/* YESTERDAY */}
        {yesterdayDatasets.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Yesterday
              </p>
            )}
            {yesterdayDatasets.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeDatasetId === item.id}
                collapsed={collapsed}
                deleting={deletingId === item.id}
                onSelect={() => onSelectDataset(item)}
                onDelete={(e) => handleDelete(item.id, e)}
              />
            ))}
          </div>
        )}

        {/* PREVIOUS DAYS */}
        {olderDatasets.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Previous 7 Days
              </p>
            )}
            {olderDatasets.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeDatasetId === item.id}
                collapsed={collapsed}
                deleting={deletingId === item.id}
                onSelect={() => onSelectDataset(item)}
                onDelete={(e) => handleDelete(item.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* USER FOOTER */}
      <div className="p-3 border-t border-border/40 bg-background/50 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-mono text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
              <p className="text-[9px] text-muted-foreground font-mono">Pro Curator</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-mono text-xs font-semibold">
              {initials}
            </div>
          </div>
        )}

        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-red-400 h-7 w-7 p-0"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  deleting,
  onSelect,
  onDelete,
}: {
  item: SavedDataset;
  active: boolean;
  collapsed: boolean;
  deleting: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group px-2.5 py-2 rounded-md flex items-center justify-between cursor-pointer transition-all ${
        active
          ? "bg-gold/15 text-gold font-medium border border-gold/30 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
      title={item.name}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${active ? "text-gold" : "text-muted-foreground"}`}
        />
        {!collapsed && (
          <span className="truncate text-xs font-sans tracking-tight leading-none">
            {item.name}
          </span>
        )}
      </div>

      {!collapsed && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 p-1"
          title="Delete dataset session"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
