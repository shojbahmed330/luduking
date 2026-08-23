import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { 
  History as HistoryIcon, 
  Calendar, 
  Edit2, 
  Trash2, 
  Dice5, 
  Coffee,
  ChevronRight,
  ChevronDown,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PositionBadge, type Position } from "@/components/ludu/PositionBadge";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { BottomDrawer } from "@/components/ludu/BottomDrawer";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

type Tab = "matches" | "expenses";

function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("matches");
  const [selectedMonth, setSelectedMonth] = useState<string>("All-Time");
  const [matches, setMatches] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: Tab; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [pRes, mRes, eRes] = await Promise.all([
      supabase.from("players").select("*"),
      supabase.from("matches").select("*, match_results(*, players(*))").order("match_date", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false })
    ]);

    setPlayers(pRes.data || []);
    setMatches(mRes.data || []);
    setExpenses(eRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    matches.forEach(m => months.add(format(parseISO(m.match_date), "MMMM yyyy")));
    expenses.forEach(e => months.add(format(parseISO(e.expense_date), "MMMM yyyy")));
    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [matches, expenses]);

  const filteredMatches = useMemo(() => {
    if (selectedMonth === "All-Time") return matches;
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(new Date(selectedMonth));
    return matches.filter(m => isWithinInterval(parseISO(m.match_date), { start, end }));
  }, [matches, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "All-Time") return expenses;
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(new Date(selectedMonth));
    return expenses.filter(e => isWithinInterval(parseISO(e.expense_date), { start, end }));
  }, [expenses, selectedMonth]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === "matches") {
        // RLS and cascade should handle results if configured, 
        // but we manually delete results first to be safe if cascade isn't set.
        await supabase.from("match_results").delete().eq("match_id", deleteConfirm.id);
        const { error } = await supabase.from("matches").delete().eq("id", deleteConfirm.id);
        if (error) throw error;
        toast.success("Match deleted");
      } else {
        const { error } = await supabase.from("expenses").delete().eq("id", deleteConfirm.id);
        if (error) throw error;
        toast.success("Expense deleted");
      }
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded-lg" />
        <div className="h-12 w-full bg-muted rounded-2xl" />
        <div className="h-10 w-full bg-muted rounded-2xl" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 w-full bg-muted rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-24"
    >
      <div className="flex items-center gap-2 px-1">
        <HistoryIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-black text-foreground">History</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-muted/40 rounded-2xl">
        <button
          onClick={() => setActiveTab("matches")}
          className={cn(
            "flex-1 py-3 rounded-xl font-black text-sm transition-all active-scale",
            activeTab === "matches" ? "bg-white shadow-sm text-ludu-gold ring-1 ring-black/5" : "text-muted-foreground/60"
          )}
        >
          Matches
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={cn(
            "flex-1 py-3 rounded-xl font-black text-sm transition-all active-scale",
            activeTab === "expenses" ? "bg-white shadow-sm text-ludu-red ring-1 ring-black/5" : "text-muted-foreground/60"
          )}
        >
          Expenses
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex flex-col gap-2">
        <BottomDrawer
          title="Filter History"
          description="View entries for a specific month or all history."
          trigger={
            <button className="flex w-full items-center justify-between rounded-2xl border-2 border-muted bg-white px-4 py-3 text-sm font-black active-scale shadow-sm">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {selectedMonth === "All-Time" ? "All-Time History" : selectedMonth}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedMonth("All-Time")}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-black transition-all active-scale",
                selectedMonth === "All-Time" ? "bg-ludu-gold text-white" : "bg-muted/30 text-foreground"
              )}
            >
              All-Time History
              {selectedMonth === "All-Time" && <Check className="h-5 w-5" />}
            </button>
            {availableMonths.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-black transition-all active-scale",
                  selectedMonth === m ? "bg-ludu-gold text-white" : "bg-muted/30 text-foreground"
                )}
              >
                {m}
                {selectedMonth === m && <Check className="h-5 w-5" />}
              </button>
            ))}
          </div>
        </BottomDrawer>
      </div>

      {/* List Content */}
      <div className="space-y-4">
        {activeTab === "matches" ? (
          filteredMatches.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border-2 border-dashed border-muted">
              <div className="flex justify-center mb-4">
                <Dice5 className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-bold">No matches logged yet — tap Add Match to get started! 🎲</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-xl border-ludu-gold text-ludu-gold font-bold"
                onClick={() => navigate({ to: "/add-match" })}
              >
                Add Match
              </Button>
            </div>
          ) : (
            filteredMatches.map(match => (
              <div key={match.id} className="rounded-3xl bg-white p-5 card-shadow border-2 border-muted group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-black text-xs uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(parseISO(match.match_date), "MMM d, yyyy")}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-ludu-blue/5 text-ludu-blue active-scale border border-ludu-blue/10"
                      onClick={() => navigate({ to: "/add-match", search: { editId: match.id } })}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-ludu-red/5 text-ludu-red active-scale border border-ludu-red/10"
                      onClick={() => setDeleteConfirm({ type: "matches", id: match.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {match.match_results.sort((a: any, b: any) => a.position - b.position).map((result: any) => (
                    <div key={result.id} className="flex items-center gap-3">
                      <div className="w-24 shrink-0">
                        <PositionBadge position={result.position as Position} />
                      </div>
                      <PlayerAvatar name={result.players?.name || "Unknown"} size="sm" />
                      <span className="font-bold text-sm flex-1">{result.players?.name}</span>
                      {result.fine_amount > 0 && (
                        <span className="text-[10px] font-black bg-ludu-red/10 text-ludu-red px-2 py-0.5 rounded-full uppercase">
                          {result.fine_amount} Taka
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          filteredExpenses.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border-2 border-dashed border-muted">
              <div className="flex justify-center mb-4">
                <Coffee className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-bold">No expenses logged yet — tap Add Expense to get started! ☕</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-xl border-ludu-red text-ludu-red font-bold"
                onClick={() => navigate({ to: "/add-expense" })}
              >
                Add Expense
              </Button>
            </div>
          ) : (
            filteredExpenses.map(expense => (
              <div key={expense.id} className="rounded-3xl bg-white p-5 shadow-sm border-2 border-muted group relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(expense.expense_date), "PPP")}
                    </div>
                    <div className="text-2xl font-black text-ludu-red">
                      {expense.amount} Taka
                    </div>
                    {expense.note && (
                      <p className="text-sm font-medium text-muted-foreground bg-muted/30 p-2 rounded-xl border-l-4 border-ludu-gold">
                        {expense.note}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-ludu-blue hover:bg-ludu-blue/10"
                      onClick={() => navigate({ to: "/add-expense", search: { editId: expense.id } })}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-ludu-red hover:bg-ludu-red/10"
                      onClick={() => setDeleteConfirm({ type: "expenses", id: expense.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="rounded-3xl max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Delete Entry?</DialogTitle>
            <DialogDescription className="font-bold">
              This will permanently remove the {deleteConfirm?.type === "matches" ? "match and all its results" : "expense"}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl py-6 font-bold"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 rounded-xl py-6 font-bold"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}