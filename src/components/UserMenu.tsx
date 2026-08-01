import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User as UserIcon, LogOut, Database, LogIn } from "lucide-react";

interface UserMenuProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
}

export function UserMenu({ user, onOpenAuth, onOpenHistory }: UserMenuProps) {
  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully.");
    }
  };

  if (!user) {
    return (
      <Button
        onClick={onOpenAuth}
        variant="outline"
        size="sm"
        className="border-border text-xs text-foreground hover:text-gold hover:border-gold/50"
      >
        <LogIn className="w-3.5 h-3.5 mr-1.5 text-gold" /> Sign In
      </Button>
    );
  }

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "US";

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onOpenHistory}
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-gold"
      >
        <Database className="w-3.5 h-3.5 mr-1.5" /> Saved Datasets
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-8 h-8 p-0 bg-gold/10 border border-gold/30 text-gold font-mono text-xs hover:bg-gold/20"
          >
            {initials}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border-border text-foreground">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-medium leading-none text-foreground">{user.email}</p>
              <p className="text-[10px] leading-none text-muted-foreground font-mono">Authenticated Session</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={onOpenHistory} className="text-xs cursor-pointer focus:bg-secondary">
            <Database className="w-3.5 h-3.5 mr-2 text-gold" /> My Saved Datasets
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={handleSignOut} className="text-xs text-red-400 cursor-pointer focus:bg-red-500/10">
            <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
