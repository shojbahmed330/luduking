import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ArrowLeft, Dice5 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { PositionBadge, type Position } from "@/components/ludu/PositionBadge";
import { POSITION_POINTS } from "@/lib/ranking";

export const Route = createFileRoute("/player/$playerId")({
  head: () => ({
    meta: [
      { title: "Player Profile — Ludu Hisab" },
      { name: "description", content: "A player's monthly matches, places, points and fines in Ludu Hisab." },
      { property: "og:title", content: "Player Profile — Ludu Hisab" },
      { property: "og:description", content: "A player's monthly matches, places, points and fines." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AuthGuard>
      <PlayerProfile />
    </AuthGuard>
  ),
});

function PlayerProfile() {
  const { playerId } = Route.useParams();
  const [player, setPlayer] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [month, setMonth] = useState(() =>
    format(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })), "MMMM yyyy"),
  );

  useEffect(() => {
    (async () => {
      const [p, r, pay] = await Promise.all([
        supabase.from("players").select("*").eq("id", playerId).maybeSingle(),
        supabase.from("match_results").select("*, matches(match_date)").eq("player_id", playerId),
        supabase.from("payments").select("*").eq("player_id", playerId),
      ]);
      setPlayer(p.data);
      setResults(r.data ?? []);
      setPayments(pay.data ?? []);
    })();
  }, [playerId]);

  const months = useMemo(() => {
    const s = new Set<string>([month]);
    results.forEach((r) => r.matches?.match_date && s.add(format(parseISO(r.matches.match_date), "MMMM yyyy")));
    return Array.from(s).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [results]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const start = startOfMonth(new Date(month));
    const end = endOfMonth(new Date(month));
    const inMonth = (d?: string) => !!d && isWithinInterval(parseISO(d), { start, end });
    const rs = results.filter((r) => inMonth(r.matches?.match_date));
    const count = (pos: number) => rs.filter((r) => r.position === pos).length;
    const points = rs.reduce((a, r) => a + (POSITION_POINTS[r.position] ?? 1), 0);
    const fines = rs.reduce((a, r) => a + Number(r.fine_amount || 0), 0);
    const paid = payments.filter((p) => inMonth(p.paid_date)).reduce((a, p) => a + Number(p.amount || 0), 0);
    const recent = [...rs].sort((a, b) => b.matches.match_date.localeCompare(a.matches.match_date)).slice(0, 10);
    return { matches: rs.length, first: count(1), second: count(2), third: count(3), fourth: count(4), points, avg: rs.length ? points / rs.length : 0, fines, paid, recent };
  }, [results, payments, month]);

  if (!player) {
    return <div className="p-8 text-center font-bold text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-md space-y-5 p-4 pb-32">
      <Link to="/players" className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground active-scale">
        <ArrowLeft className="h-4 w-4" /> Players
      </Link>

      <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-ludu-gold/20 bg-card p-6 card-shadow">
        <PlayerAvatar name={player.name} size="lg" className="ring-4 ring-ludu-gold/40" />
        <h1 className="text-2xl font-black text-foreground">{player.name}</h1>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-full border-2 border-muted bg-muted/30 px-4 py-1.5 text-xs font-black text-foreground"
        >
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Matches", v: stats.matches },
          { l: "Score", v: stats.avg.toFixed(2) },
          { l: "Points", v: stats.points },
          { l: "Fines", v: `${stats.fines} ৳` },
          { l: "Paid", v: `${stats.paid} ৳` },
          { l: "Due", v: `${Math.max(0, stats.fines - stats.paid)} ৳` },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border-2 border-muted bg-card p-3 text-center card-shadow">
            <div className="text-lg font-black text-foreground">{s.v}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[["🥇", stats.first, "text-ludu-gold"], ["🥈", stats.second, "text-ludu-green"], ["🥉", stats.third, "text-ludu-blue"], ["4️⃣", stats.fourth, "text-ludu-red"]].map(([icon, v, c]) => (
          <div key={icon as string} className="rounded-2xl bg-muted/30 p-3 text-center">
            <div className="text-xl">{icon}</div>
            <div className={`text-lg font-black ${c}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="px-1 text-xs font-black uppercase tracking-widest text-muted-foreground">Recent matches</h2>
        {stats.recent.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-muted p-8 text-center">
            <Dice5 className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">No matches this month yet</p>
          </div>
        ) : (
          stats.recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border-2 border-muted bg-card p-3">
              <span className="text-xs font-black text-muted-foreground">{format(parseISO(r.matches.match_date), "EEE, MMM d")}</span>
              <PositionBadge position={r.position as Position} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
