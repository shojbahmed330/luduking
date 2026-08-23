import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from "date-fns";
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
import { Calendar as CalendarUI } from "@/components/ui/calendar";
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
  head: () => ({
    meta: [
      { title: "Ludu Hisab — History" },
      {
        name: "description",
        content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            I have approved the plan",
      },
      { property: "og:title", content: "Ludu Hisab — History" },
      { property: "og:description", content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            I have approved the plan" },
    ],
  }),
  component: HistoryPage,
});

type Tab = "matches" | "expenses";

function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("matches");
  const [selectedMonth, setSelectedMonth] = useState<string>("All-Time");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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
    let result = matches;
    if (selectedDate) {
      result = matches.filter(m => isSameDay(parseISO(m.match_date), selectedDate));
    } else if (selectedMonth !== "All-Time") {
      const start = startOfMonth(new Date(selectedMonth));
      const end = endOfMonth(new Date(selectedMonth));
      result = matches.filter(m => isWithinInterval(parseISO(m.match_date), { start, end }));
    }
    
    // Further group by day to show daily sectioning
    return result;
  }, [matches, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    let result = expenses;
    if (selectedDate) {
      result = expenses.filter(e => isSameDay(parseISO(e.expense_date), selectedDate));
    } else if (selectedMonth !== "All-Time") {
      const start = startOfMonth(new Date(selectedMonth));
      const end = endOfMonth(new Date(selectedMonth));
      result = expenses.filter(e => isWithinInterval(parseISO(e.expense_date), { start, end }));
    }
    return result;
  }, [expenses, selectedMonth]);

  const matchesGroupedByDay = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredMatches.forEach(match => {
      const day = format(parseISO(match.match_date), "yyyy-MM-dd");
      if (!groups[day]) groups[day] = [];
      groups[day].push(match);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredMatches]);

  const expensesGroupedByDay = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredExpenses.forEach(expense => {
      const day = format(parseISO(expense.expense_date), "yyyy-MM-dd");
      if (!groups[day]) groups[day] = [];
      groups[day].push(expense);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredExpenses]);

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
      <div className="flex flex-col gap-6 p-4">
        <div className="h-8 w-32 bg-muted/40 animate-pulse rounded-lg" />
        <div className="h-14 w-full bg-muted/40 animate-pulse rounded-2xl" />
        <div className="h-12 w-full bg-muted/40 animate-pulse rounded-2xl" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 w-full bg-muted/40 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-24"
    >
      <div className="flex items-center gap-2 px-1">
        <HistoryIcon className="h-6 w-6 text-ludu-blue" />
        <h1 className="text-2xl font-black text-foreground tracking-tight">Daily Breakdown</h1>
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
                {selectedDate 
                  ? format(selectedDate, "MMM d, yyyy") 
                  : selectedMonth === "All-Time" 
                    ? "All-Time History" 
                    : selectedMonth}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            <div className="bg-muted/20 rounded-2xl p-2 mb-2">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setSelectedMonth(format(date, "MMMM yyyy"));
                }}
                className="rounded-xl border-none"
              />
            </div>
            <button
              onClick={() => {
                setSelectedMonth("All-Time");
                setSelectedDate(undefined);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-black transition-all active-scale",
                (selectedMonth === "All-Time" && !selectedDate) ? "bg-ludu-gold text-white" : "bg-muted/30 text-foreground"
              )}
            >
              All-Time History
              {(selectedMonth === "All-Time" && !selectedDate) && <Check className="h-5 w-5" />}
            </button>
            {availableMonths.map(m => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setSelectedDate(undefined);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-black transition-all active-scale",
                  (selectedMonth === m && !selectedDate) ? "bg-ludu-gold text-white" : "bg-muted/30 text-foreground"
                )}
              >
                {m}
                {(selectedMonth === m && !selectedDate) && <Check className="h-5 w-5" />}
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
              <button 
                className="mt-6 w-full rounded-2xl bg-ludu-gold text-white font-black py-4 shadow-lg shadow-ludu-gold/20 active-scale"
                onClick={() => navigate({ to: "/add-match" })}
              >
                Add Match
              </button>
            </div>
          ) : (
            matchesGroupedByDay.map(([day, dayMatches]) => (
              <div key={day} className="space-y-3">
                <div className="flex items-center gap-2 px-1 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                  <div className="h-px flex-1 bg-muted" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/40 px-2 py-0.5 rounded-full">
                    {format(parseISO(day), "EEEE, MMM d")}
                  </span>
                  <div className="h-px flex-1 bg-muted" />
                </div>
                {dayMatches.map(match => (
                  <div key={match.id} className="rounded-3xl bg-white p-5 card-shadow border-2 border-muted group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                        <Dice5 className="h-3 w-3 text-ludu-gold" />
                        Match #{match.id.slice(0, 4)}
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
                        <div key={result.id} className="flex items-center gap-3 p-2 rounded-2xl transition-colors hover:bg-muted/10">
                          <div className="w-20 shrink-0">
                            <PositionBadge position={result.position as Position} />
                          </div>
                          <PlayerAvatar name={result.players?.name || "Unknown"} size="xs" />
                          <span className="font-bold text-xs flex-1 truncate">{result.players?.name}</span>
                          {result.fine_amount > 0 && (
                            <span className="text-[9px] font-black bg-ludu-red text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm shadow-ludu-red/20">
                              {result.fine_amount} ৳
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
              <button 
                className="mt-6 w-full rounded-2xl bg-ludu-red text-white font-black py-4 shadow-lg shadow-ludu-red/20 active-scale"
                onClick={() => navigate({ to: "/add-expense" })}
              >
                Add Expense
              </button>
            </div>
          ) : (
            expensesGroupedByDay.map(([day, dayExpenses]) => (
              <div key={day} className="space-y-3">
                <div className="flex items-center gap-2 px-1 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                  <div className="h-px flex-1 bg-muted" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/40 px-2 py-0.5 rounded-full">
                    {format(parseISO(day), "EEEE, MMM d")}
                  </span>
                  <div className="h-px flex-1 bg-muted" />
                </div>
                {dayExpenses.map(expense => (
                  <div key={expense.id} className="rounded-3xl bg-white p-5 card-shadow border-2 border-muted group relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                          <Coffee className="h-3 w-3 text-ludu-red" />
                          Cha-Nasta Entry
                        </div>
                        <div className="text-3xl font-black text-ludu-red tracking-tight">
                          {expense.amount} <span className="text-xl">৳</span>
                        </div>
                        {expense.note && (
                          <p className="text-sm font-bold text-muted-foreground/80 bg-muted/20 p-3 rounded-2xl border-l-4 border-ludu-gold leading-snug">
                            {expense.note}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button 
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-ludu-blue/5 text-ludu-blue active-scale border border-ludu-blue/10"
                          onClick={() => navigate({ to: "/add-expense", search: { editId: expense.id } })}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-ludu-red/5 text-ludu-red active-scale border border-ludu-red/10"
                          onClick={() => setDeleteConfirm({ type: "expenses", id: expense.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
            <button 
              className="flex-1 rounded-2xl py-4 font-black bg-muted/40 text-muted-foreground active-scale transition-colors"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              className="flex-1 rounded-2xl py-4 font-black bg-ludu-red text-white shadow-lg shadow-ludu-red/20 active-scale transition-colors"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}