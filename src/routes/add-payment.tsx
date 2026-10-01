import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Wallet, Calendar, ArrowLeft, Check } from "lucide-react";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { computeDues } from "@/lib/dues";
import { z } from "zod";

const paymentSearchSchema = z.object({
  editId: z.string().optional(),
  playerId: z.string().optional(),
});

export const Route = createFileRoute("/add-payment")({
  validateSearch: (search) => paymentSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Ludu Hisab — Add Payment" },
      { name: "description", content: "Record a player's payment against their outstanding Ludu fine dues." },
      { property: "og:title", content: "Ludu Hisab — Add Payment" },
      { property: "og:description", content: "Record a player's payment against their outstanding Ludu fine dues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddPayment,
});

function AddPayment() {
  const navigate = useNavigate();
  const { editId, playerId } = useSearch({ from: "/add-payment" });

  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(playerId || "");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, mRes, mrRes, payRes] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("matches").select("id, match_date"),
        supabase.from("match_results").select("*"),
        supabase.from("payments").select("*"),
      ]);
      setPlayers(pRes.data || []);
      setMatches(mRes.data || []);
      setMatchResults(mrRes.data || []);
      setPayments(payRes.data || []);

      if (editId) {
        const existing = (payRes.data || []).find((p: any) => p.id === editId);
        if (existing) {
          setSelectedPlayerId(existing.player_id);
          setDate(existing.paid_date);
          setAmount(String(existing.amount));
          setNote(existing.note || "");
        } else {
          toast.error("Payment not found");
        }
      }
      setLoading(false);
    }
    load();
  }, [editId]);

  const dues = useMemo(
    () => computeDues(players, matches, matchResults, payments),
    [players, matches, matchResults, payments],
  );

  const selectedDue = dues.find((d) => d.id === selectedPlayerId);
  // When editing, the old amount is already counted as paid — add it back.
  const editingAmount = editId ? (payments.find((p) => p.id === editId)?.amount ?? 0) : 0;
  const currentDue = selectedDue ? selectedDue.due + editingAmount : null;
  const parsedAmount = parseInt(amount) || 0;
  const afterDue = currentDue !== null ? currentDue - parsedAmount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      toast.error("Please select a player");
      return;
    }
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
          .from("payments")
          .update({
            player_id: selectedPlayerId,
            paid_date: date,
            amount: parseInt(amount),
            note: note.trim() || null,
            updated_by_name: userName,
          })
          .eq("id", editId);
        if (error) throw error;
        toast.success("Payment updated! 💰");
      } else {
        const { error } = await supabase.from("payments").insert({
          player_id: selectedPlayerId,
          paid_date: date,
          amount: parseInt(amount),
          note: note.trim() || null,
          created_by_name: userName,
        });
        if (error) throw error;
        toast.success("Payment recorded! 💰");
        fireConfetti();
      }
      navigate({ to: editId ? "/history" : "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to save payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6 pb-24"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: editId ? "/history" : "/" })}
            className="rounded-full bg-card p-2.5 shadow-sm border-2 border-muted active-scale text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-ludu-green" />
            {editId ? "Edit Payment" : "Add Payment"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
              Who is paying?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => {
                const d = dues.find((x) => x.id === p.id);
                const active = selectedPlayerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border-2 bg-card p-3 text-left active-scale transition-all",
                      active ? "border-ludu-green shadow-sm" : "border-muted",
                    )}
                  >
                    <PlayerAvatar name={p.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{p.name}</p>
                      <p className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        (d?.due ?? 0) > 0 ? "text-ludu-red" : "text-ludu-green",
                      )}>
                        Due {d?.due ?? 0} ৳
                      </p>
                    </div>
                    {active && <Check className="h-4 w-4 text-ludu-green shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <Calendar className="h-3.5 w-3.5" /> Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border-2 border-muted bg-card p-4 text-lg font-black outline-none focus:border-ludu-green transition-colors shadow-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Amount Paid (৳)
              </label>
              {currentDue !== null && currentDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(currentDue))}
                  className="text-[10px] font-black uppercase tracking-widest text-ludu-green active-scale"
                >
                  Pay full due ({currentDue} ৳)
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border-2 border-muted bg-card p-4 pl-12 text-3xl font-black text-ludu-green outline-none focus:border-ludu-green transition-colors shadow-sm"
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
              placeholder="e.g. Cash handed to Shojib"
              className="w-full rounded-2xl border-2 border-muted bg-card p-4 text-base font-bold outline-none focus:border-ludu-gold transition-colors resize-none h-24 shadow-sm"
            />
          </div>

          <div className="rounded-3xl bg-card p-6 card-shadow border-2 border-muted space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Current Due</span>
              <span className="text-lg font-black text-foreground">
                {loading ? "..." : currentDue !== null ? `${currentDue} ৳` : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">After Payment</span>
              <span className={cn(
                "text-xl font-black transition-colors",
                (afterDue ?? 0) > 0 ? "text-ludu-red" : "text-ludu-green",
              )}>
                {afterDue !== null ? `${afterDue} ৳` : "—"}
              </span>
            </div>
          </div>

          <PrimaryButton type="submit" disabled={isSubmitting} className="mt-4">
            {isSubmitting ? "Saving..." : "Save Payment 💰"}
          </PrimaryButton>
        </form>
      </motion.div>
    </AuthGuard>
  );
}
