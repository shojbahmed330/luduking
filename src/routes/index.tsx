import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from "date-fns";
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
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Check,
  Dice5
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ludu/StatCard";
import { PositionBadge } from "@/components/ludu/PositionBadge";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { BottomDrawer } from "@/components/ludu/BottomDrawer";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludu Hisab — Dashboard" },
      {
        name: "description",
        content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            I have approved the plan",
      },
      { property: "og:title", content: "Ludu Hisab — Dashboard" },
      { property: "og:description", content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            I have approved the plan" },
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "leaderboard" | "money" | "chanasta">("overview");
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
    if (selectedDate) {
      const fMatches = matches.filter(m => isSameDay(parseISO(m.match_date), selectedDate));
      const matchIds = new Set(fMatches.map(m => m.id));
      const fMatchResults = matchResults.filter(mr => matchIds.has(mr.match_id));
      const fExpenses = expenses.filter(e => isSameDay(parseISO(e.expense_date), selectedDate));
      return { matches: fMatches, matchResults: fMatchResults, expenses: fExpenses };
    }

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
      <div className="flex flex-col gap-6 animate-pulse pt-2">
        <div className="h-14 w-full bg-muted/40 rounded-2xl" />
        <div className="h-28 w-full bg-muted/40 rounded-3xl" />
        <div className="h-12 w-full bg-muted/20 rounded-2xl mt-4" />
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="h-28 bg-muted/30 rounded-3xl" />
          <div className="h-28 bg-muted/30 rounded-3xl" />
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
      <div className="flex flex-col gap-4 sticky top-0 bg-background/95 backdrop-blur-md pt-2 pb-4 z-40">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <Calendar className="h-3 w-3" /> Select Period
          </label>
          <BottomDrawer
            title="Choose Period"
            description="Filter dashboard data by month or view all history."
            trigger={
              <button className="flex w-full items-center justify-between rounded-2xl border-2 border-muted bg-white px-5 py-3.5 text-base font-black active-scale shadow-sm text-left">
                <span className="flex items-center gap-2">
                  {selectedDate 
                    ? format(selectedDate, "MMM d, yyyy") 
                    : selectedMonth === "All-Time" 
                      ? "All-Time History" 
                      : selectedMonth}
                </span>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
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

        <StatCard 
          label="Current Fund Balance (All-Time)" 
          value={`${allTimeBalance} ৳`} 
          icon={<Star className="h-5 w-5" />}
          variant="gold"
          className="shadow-md"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="relative flex p-1 bg-muted/30 rounded-2xl shrink-0">
        <div 
          className="absolute h-[calc(100%-8px)] bg-white rounded-xl shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out z-0"
          style={{
            width: `calc(20% - 2.4px)`,
            left: `calc(${['overview', 'matches', 'leaderboard', 'money', 'chanasta'].indexOf(activeTab) * 20}% + 4px)`
          }}
        />
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'matches', label: 'Matches', icon: Dice5 },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'money', label: 'Money', icon: Users },
          { id: 'chanasta', label: 'Cha-Nasta', icon: Coffee },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "relative z-10 flex-1 min-w-[60px] flex flex-col items-center justify-center gap-1 px-1 py-2.5 rounded-xl text-[10px] font-black transition-all active-scale",
              activeTab === tab.id 
                ? "text-ludu-gold" 
                : "text-muted-foreground hover:bg-white/30"
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
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/add-match" 
                className="flex flex-col items-center justify-center py-5 rounded-3xl border-2 border-muted bg-white card-shadow hover:border-ludu-gold/50 transition-all group active-scale"
              >
                <div className="h-10 w-10 rounded-2xl bg-ludu-gold/10 flex items-center justify-center text-ludu-gold mb-2 group-hover:scale-110 transition-transform">
                  <Dice5 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Match</span>
              </Link>
              
              <Link 
                to="/add-expense" 
                className="flex flex-col items-center justify-center py-5 rounded-3xl border-2 border-muted bg-white card-shadow hover:border-ludu-red/50 transition-all group active-scale"
              >
                <div className="h-10 w-10 rounded-2xl bg-ludu-red/10 flex items-center justify-center text-ludu-red mb-2 group-hover:scale-110 transition-transform">
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Expense</span>
              </Link>
            </div>
          </motion.div>
        )}

        {activeTab === 'matches' && (
          <motion.div 
            key="matches"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <Dice5 className="h-5 w-5 text-ludu-gold" />
              <h2 className="text-xl font-black text-foreground">Match Details</h2>
            </div>
            
            {filteredData.matches.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center border-2 border-dashed border-muted text-muted-foreground font-bold">
                No matches played this period 🎲
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.matches
                  .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
                  .map(match => (
                    <div key={match.id} className="rounded-3xl bg-white p-5 card-shadow border-2 border-muted">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                          <Dice5 className="h-3 w-3 text-ludu-gold" />
                          Match #{match.id.slice(0, 4)}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-full">
                          {format(parseISO(match.match_date), "MMM d, yyyy")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {matchResults
                          .filter(mr => mr.match_id === match.id)
                          .sort((a, b) => a.position - b.position)
                          .map((result) => {
                            const player = players.find(p => p.id === result.player_id);
                            return (
                              <div key={result.player_id} className="flex items-center gap-3 p-2 rounded-2xl transition-colors hover:bg-muted/10">
                                <div className="w-20 shrink-0">
                                  <PositionBadge position={result.position as any} />
                                </div>
                                <PlayerAvatar name={player?.name || "???"} size="xs" />
                                <span className="font-bold text-xs flex-1 truncate">{player?.name}</span>
                                {result.fine_amount > 0 && (
                                  <span className="text-[9px] font-black bg-ludu-red text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm shadow-ludu-red/20">
                                    {result.fine_amount} ৳
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
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
              <div className="grid grid-cols-1 gap-4">
                {playerLeaderboard.map((player) => (
                  <div 
                    key={player.id} 
                    className="bg-white rounded-3xl p-5 border-2 border-muted shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} size="md" />
                      <div className="flex-1">
                        <p className="font-black text-lg text-foreground">{player.name}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Player Rankings</p>
                      </div>
                      <div className="flex items-center gap-1 bg-ludu-gold/10 px-2 py-0.5 rounded-full shrink-0">
                        <Star className="h-3 w-3 text-ludu-gold fill-ludu-gold" />
                        <span className="text-[10px] font-black text-ludu-gold">{player.counts[1] || 0} Wins</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-muted/50">
                      <div className="flex flex-col items-center gap-1">
                        <PositionBadge position={1} />
                        <span className="text-sm font-black text-foreground">{player.counts[1] || 0}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <PositionBadge position={2} />
                        <span className="text-sm font-black text-foreground">{player.counts[2] || 0}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <PositionBadge position={3} />
                        <span className="text-sm font-black text-foreground">{player.counts[3] || 0}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <PositionBadge position={4} />
                        <span className="text-sm font-black text-foreground">{player.counts[4] || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
            <div className="grid grid-cols-1 gap-4">
              {contributionLeaderboard.map((player, index) => (
                <div 
                  key={player.id} 
                  className={cn(
                    "bg-white rounded-3xl p-5 border-2 border-muted card-shadow flex items-center justify-between active-scale transition-all",
                    index === 0 && "border-ludu-red/20 bg-gradient-to-br from-ludu-red/5 to-white",
                    index === contributionLeaderboard.length - 1 && contributionLeaderboard.length > 1 && "border-ludu-green/20 bg-gradient-to-br from-ludu-green/5 to-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <PlayerAvatar name={player.name} size="md" />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 bg-ludu-red text-white p-1 rounded-full shadow-sm ring-2 ring-white">
                          <TrendingUp className="h-3 w-3" />
                        </div>
                      )}
                      {index === contributionLeaderboard.length - 1 && contributionLeaderboard.length > 1 && (
                        <div className="absolute -top-1 -right-1 bg-ludu-green text-white p-1 rounded-full shadow-sm ring-2 ring-white">
                          <Star className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-lg text-foreground">{player.name}</p>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        {index === 0 ? "Biggest Contributor 💸" : (index === contributionLeaderboard.length - 1 && contributionLeaderboard.length > 1) ? "Luckiest Player 🎉" : "Fine Contributor"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-foreground">{player.totalFine} <span className="text-sm">৳</span></p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em]">Total Paid</p>
                  </div>
                </div>
              ))}
            </div>
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
