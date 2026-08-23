import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Coffee, Calendar, AlertTriangle, ArrowLeft } from "lucide-react";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { z } from "zod";

const expenseSearchSchema = z.object({
  editId: z.string().optional(),
});

export const Route = createFileRoute("/add-expense")({
  validateSearch: (search) => expenseSearchSchema.parse(search),
  component: AddExpense,
});

function AddExpense() {
  const navigate = useNavigate();
  const { editId } = useSearch({ from: "/add-expense" });
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId);

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

  useEffect(() => {
    async function fetchExpenseToEdit() {
      if (!editId) return;

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", editId)
        .single();

      if (error || !data) {
        toast.error("Failed to load expense for editing");
        setIsLoadingEdit(false);
        return;
      }

      setDate(data.expense_date);
      setAmount(data.amount.toString());
      setNote(data.note || "");
      setIsLoadingEdit(false);
    }
    fetchExpenseToEdit();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userName = (user?.user_metadata?.["full_name"] as string) || user?.email || "Unknown User";

      if (editId) {
        const { error } = await supabase
          .from("expenses")
          .update({
            expense_date: date,
            amount: parseInt(amount),
            note: note.trim() || null,
            updated_by_name: userName,
          })
          .eq("id", editId);

        if (error) throw error;
        toast.success("Expense updated! ☕");
      } else {
        const { error } = await supabase
          .from("expenses")
          .insert({
            expense_date: date,
            amount: parseInt(amount),
            note: note.trim() || null,
            created_by_name: userName,
            user_id: user?.id ?? null,
          });

        if (error) throw error;
        toast.success("Expense saved! ☕");
      }
      navigate({ to: editId ? "/history" : "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEdit) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-16 w-full bg-muted rounded-2xl" />
        <div className="h-16 w-full bg-muted rounded-2xl" />
        <div className="h-32 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  const amountVal = parseInt(amount) || 0;
  const afterBalance = currentBalance !== null ? currentBalance - amountVal : null;
  const isNegative = afterBalance !== null && afterBalance < 0;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-24"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: editId ? "/history" : "/" })}
          className="rounded-full bg-white p-2.5 shadow-sm border-2 border-muted active-scale text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Coffee className="h-6 w-6 text-ludu-red" />
          {editId ? "Edit Expense" : "Add Expense"}
        </h1>
      </div>


      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <Calendar className="h-3.5 w-3.5" /> Expense Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border-2 border-muted bg-white p-4 text-lg font-black outline-none focus:border-ludu-red transition-colors shadow-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
            Amount Spent (৳)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border-2 border-muted bg-white p-4 pl-12 text-3xl font-black text-ludu-red outline-none focus:border-ludu-red transition-colors shadow-sm"
              required
              min="1"
              step="1"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground/30">৳</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Biscuits and tea for evening session"
            className="w-full rounded-2xl border-2 border-muted bg-white p-4 text-base font-bold outline-none focus:border-ludu-gold transition-colors resize-none h-28 shadow-sm"
          />
        </div>

        <div className="rounded-3xl bg-white p-6 card-shadow border-2 border-muted space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Balance Now</span>
            <span className="text-lg font-black text-foreground">
              {currentBalance !== null ? `${currentBalance} ৳` : "..."}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-dashed">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">After Expense</span>
            <span className={cn(
              "text-xl font-black transition-colors",
              isNegative ? "text-ludu-red" : "text-ludu-green"
            )}>
              {afterBalance !== null ? `${afterBalance} ৳` : "—"}
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
      </motion.div>
    </>
  );
}
