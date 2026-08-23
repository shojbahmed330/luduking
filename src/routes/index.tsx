import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { 
  Trophy, 
  Users, 
  Wallet, 
  Coffee, 
  Calendar, 
  TrendingDown, 
  TrendingUp,
  Star,
  Frown,
  PlusCircle,
  LayoutDashboard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ludu/StatCard";
import { PositionBadge } from "@/components/ludu/PositionBadge";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludu Hisab — Dashboard" },
      {
        name: "description",
        content: "Track Ludu match results, fines and shared cha-nasta expenses in one place.",
      },
      { property: "og:title", content: "Ludu Hisab — Dashboard" },
      { property: "og:description", content: "Track Ludu match results, fines and shared cha-nasta expenses in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Player = { id: string; name: string };
type Match = { id: string; match_date: string };
type MatchResult = { match_id: string; player_id: string; position: number; fine_amount: number };
type Expense = { amount: number; expense_date: string };

function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("All-Time");
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard" | "money" | "chanasta">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [pRes, mRes, mrRes, eRes] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("matches").select("*"),
        supabase.from("match_results").select("*"),
        supabase.from("expenses").select("*")
      ]);

      setPlayers(pRes.data || []);
      setMatches(mRes.data || []);
      setMatchResults(mrRes.data || []);
      setExpenses(eRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    matches.forEach(m => months.add(format(parseISO(m.match_date), "MMMM yyyy")));
    expenses.forEach(e => months.add(format(parseISO(e.expense_date), "MMMM yyyy")));
    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [matches, expenses]);

  const filteredData = useMemo(() => {
    if (selectedMonth === "All-Time") {
      return { matches, matchResults, expenses };
    }

    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(new Date(selectedMonth));

    const fMatches = matches.filter(m => {
      const date = parseISO(m.match_date);
      return isWithinInterval(date, { start, end });
    });

    const matchIds = new Set(fMatches.map(m => m.id));
    const fMatchResults = matchResults.filter(mr => matchIds.has(mr.match_id));

    const fExpenses = expenses.filter(e => {
      const date = parseISO(e.expense_date);
      return isWithinInterval(date, { start, end });
    });

    return { matches: fMatches, matchResults: fMatchResults, expenses: fExpenses };
  }, [selectedMonth, matches, matchResults, expenses]);

  const allTimeBalance = useMemo(() => {
    const totalFines = matchResults.reduce((acc, curr) => acc + curr.fine_amount, 0);
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return totalFines - totalExp;
  }, [matchResults, expenses]);

  const periodStats = useMemo(() => {
    const totalFines = filteredData.matchResults.reduce((acc, curr) => acc + curr.fine_amount, 0);
    const totalExp = filteredData.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalFines,
      totalExpenses: totalExp,
      matchCount: filteredData.matches.length
    };
  }, [filteredData]);

  const playerLeaderboard = useMemo(() => {
    const stats = players.map(player => {
      const results = filteredData.matchResults.filter(mr => mr.player_id === player.id);
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      let totalFine = 0;
      results.forEach(r => {
        counts[r.position] = (counts[r.position] || 0) + 1;
        totalFine += r.fine_amount;
      });
      return { ...player, counts, totalFine };
    });

    return stats.sort((a, b) => (b.counts[1] || 0) - (a.counts[1] || 0));
  }, [players, filteredData]);

  const contributionLeaderboard = useMemo(() => {
    return [...playerLeaderboard].sort((a, b) => b.totalFine - a.totalFine);
  }, [playerLeaderboard]);

  const expenseSummary = useMemo(() => {
    const distinctDays = new Set(filteredData.expenses.map(e => e.expense_date)).size;
    const avgSpend = distinctDays > 0 ? periodStats.totalExpenses / distinctDays : 0;
    return {
      entryCount: filteredData.expenses.length,
      avgSpend
    };
  }, [filteredData, periodStats]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-16 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 col-span-2 bg-muted rounded-3xl" />
        </div>
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
      {/* Fixed Top Section */}
      <div className="flex flex-col gap-4 sticky top-0 bg-background/95 backdrop-blur-md pt-2 pb-4 z-30">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
            <Calendar className="h-3 w-3" /> Select Period
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full rounded-2xl border-2 border-muted bg-white px-4 py-3 text-base font-black outline-none focus:border-ludu-gold transition-colors appearance-none shadow-sm"
          >
            <option value="All-Time">All-Time History</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <StatCard 
          label="Current Fund Balance (All-Time)" 
          value={`${allTimeBalance} ৳`} 
          icon={<Star className="h-5 w-5" />}
          variant="gold"
          className="shadow-md"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-muted/30 rounded-2xl">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'money', label: 'Money', icon: Users },
          { id: 'chanasta', label: 'Cha-Nasta', icon: Coffee },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all active-scale",
              activeTab === tab.id 
                ? "bg-white text-ludu-gold shadow-sm ring-1 ring-black/5" 
                : "text-muted-foreground hover:bg-white/50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-ludu-gold" : "text-muted-foreground")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="Fund Collected" 
                value={`${periodStats.totalFines} ৳`} 
                icon={<Wallet className="h-4 w-4" />}
                trend={{ value: "Fines", isPositive: true }}
              />
              <StatCard 
                label="Matches Played" 
                value={periodStats.matchCount} 
                icon={<LayoutDashboard className="h-4 w-4" />}
              />
            </div>
            <StatCard 
              label="Total Cha-Nasta Expense" 
              value={`${periodStats.totalExpenses} ৳`} 
              icon={<Coffee className="h-4 w-4" />}
              variant="red"
            />
            
            <Link 
              to="/add-match" 
              className="mt-4 flex flex-col items-center justify-center py-8 rounded-3xl border-2 border-dashed border-muted hover:border-ludu-gold hover:bg-ludu-gold/5 transition-all group active-scale"
            >
              <PlusCircle className="h-8 w-8 text-muted-foreground group-hover:text-ludu-gold transition-colors mb-2" />
              <span className="font-black text-muted-foreground group-hover:text-ludu-gold">Add New Match</span>
            </Link>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <Trophy className="h-5 w-5 text-ludu-gold" />
              <h2 className="text-xl font-black text-foreground">Position Stats</h2>
            </div>
            {filteredData.matches.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center border-2 border-dashed border-muted text-muted-foreground font-bold">
                No matches played this period 🎲
              </div>
            ) : (
              <div className="rounded-3xl bg-white shadow-sm border-2 border-muted overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="p-4 text-xs font-black uppercase text-muted-foreground">Player</th>
                        <th className="p-4 text-center"><PositionBadge position={1} /></th>
                        <th className="p-4 text-center"><PositionBadge position={2} /></th>
                        <th className="p-4 text-center"><PositionBadge position={3} /></th>
                        <th className="p-4 text-center"><PositionBadge position={4} /></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted">
                      {playerLeaderboard.map((player) => (
                        <tr key={player.id} className="group hover:bg-muted/10 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <PlayerAvatar name={player.name} size="sm" />
                              <span className="font-bold text-foreground">{player.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-black text-ludu-gold">{player.counts[1] || 0}</td>
                          <td className="p-4 text-center font-black text-ludu-green">{player.counts[2] || 0}</td>
                          <td className="p-4 text-center font-black text-ludu-blue">{player.counts[3] || 0}</td>
                          <td className="p-4 text-center font-black text-ludu-red">{player.counts[4] || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'money' && (
          <motion.div 
            key="money"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 px-1">
              <Users className="h-5 w-5 text-ludu-blue" />
              <h2 className="text-xl font-black text-foreground">Fine Contributions</h2>
            </div>
            <div className="rounded-3xl bg-white shadow-sm border-2 border-muted overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="p-4 text-xs font-black uppercase text-muted-foreground">Player</th>
                    <th className="p-4 text-right text-xs font-black uppercase text-muted-foreground">Total Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {contributionLeaderboard.map((player) => (
                    <tr key={player.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar name={player.name} size="sm" />
                          <span className="font-bold text-foreground">{player.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-black text-foreground">{player.totalFine} ৳</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {contributionLeaderboard.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-ludu-red/5 border-2 border-ludu-red/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-ludu-red p-2 text-white">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-ludu-red/60 tracking-wider">💸 Biggest Contributor</p>
                      <p className="font-bold text-foreground">{contributionLeaderboard[0]?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-ludu-red">{contributionLeaderboard[0]?.totalFine || 0} ৳</p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-ludu-green/5 border-2 border-ludu-green/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-ludu-green p-2 text-white">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-ludu-green/60 tracking-wider">🎉 Luckiest Player</p>
                      <p className="font-bold text-foreground">{contributionLeaderboard[contributionLeaderboard.length - 1]?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-ludu-green">{contributionLeaderboard[contributionLeaderboard.length - 1]?.totalFine || 0} ৳</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'chanasta' && (
          <motion.div 
            key="chanasta"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 px-1">
              <Coffee className="h-5 w-5 text-ludu-red" />
              <h2 className="text-xl font-black text-foreground">Tea & Snacks Summary</h2>
            </div>
            {filteredData.expenses.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center border-2 border-dashed border-muted text-muted-foreground font-bold">
                No expenses recorded this period ☕
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 shadow-sm border-2 border-muted space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">Expense Entries</span>
                  <span className="font-black text-foreground">{expenseSummary.entryCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">Total Spent</span>
                  <span className="font-black text-foreground">{periodStats.totalExpenses} ৳</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed">
                  <span className="text-sm font-bold text-muted-foreground">Avg. Daily Spend</span>
                  <span className="font-black text-ludu-blue">{Math.round(expenseSummary.avgSpend)} ৳</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
