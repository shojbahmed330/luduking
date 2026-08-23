import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Coffee, Calendar, AlertTriangle, ArrowLeft } from "lucide-react";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { StatCard } from "@/components/ludu/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/add-expense")({
  component: AddExpense,
});

function AddExpense() {
  const navigate = useNavigate();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBalance() {
      // Get total fines
      const { data: finesData } = await supabase
        .from("match_results")
        .select("fine_amount");
      
      const totalFines = (finesData || []).reduce((acc, curr) => acc + (curr.fine_amount || 0), 0);

      // Get total expenses
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount");
      
      const totalExpenses = (expensesData || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);

      setCurrentBalance(totalFines - totalExpenses);
    }
    fetchBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("expenses")
        .insert({
          date,
          amount: parseInt(amount),
          note: note.trim() || null,
        });

      if (error) throw error;

      toast.success("Expense saved! ☕");
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountVal = parseInt(amount) || 0;
  const afterBalance = currentBalance !== null ? currentBalance - amountVal : null;
  const isNegative = afterBalance !== null && afterBalance < 0;

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-full bg-white p-2 shadow-sm border text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-foreground">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Expense Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border-2 border-muted bg-white p-4 text-lg font-bold outline-none focus:border-ludu-blue transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">
            Amount Spent (Taka)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            className="w-full rounded-2xl border-2 border-muted bg-white p-4 text-2xl font-black text-ludu-red outline-none focus:border-ludu-red transition-colors"
            required
            min="1"
            step="1"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="biscuits and tea for evening session"
            className="w-full rounded-2xl border-2 border-muted bg-white p-4 text-base font-medium outline-none focus:border-ludu-gold transition-colors resize-none h-24"
          />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border-2 border-muted space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-muted-foreground">Current Fund Balance</span>
            <span className="text-lg font-black text-foreground">
              {currentBalance !== null ? `${currentBalance} Taka` : "Loading..."}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-dashed">
            <span className="text-sm font-bold text-muted-foreground">After this expense</span>
            <span className={cn(
              "text-xl font-black transition-colors",
              isNegative ? "text-ludu-red" : "text-ludu-green"
            )}>
              {afterBalance !== null ? `${afterBalance} Taka` : "—"}
            </span>
          </div>

          <AnimatePresence>
            {isNegative && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-xl bg-ludu-red/10 p-3 text-ludu-red text-xs font-bold"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>⚠️ Fund balance will go negative.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PrimaryButton 
          type="submit" 
          disabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? "Saving..." : "Save Expense ☕"}
        </PrimaryButton>
      </form>
    </div>
  );
}
