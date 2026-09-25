import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameDay, subMonths, eachMonthOfInterval } from "date-fns";
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
  Dice5,
  ArrowRight,
  HandCoins
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ludu/StatCard";
import { PositionBadge } from "@/components/ludu/PositionBadge";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { BottomDrawer } from "@/components/ludu/BottomDrawer";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { computeDues, type DuePayment } from "@/lib/dues";
import { computeRanking, getBestPlayer, POSITION_POINTS, MIN_MATCHES_FOR_BEST } from "@/lib/ranking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludu Hisab — Dashboard" },
      {
        name: "description",
        content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Ami to tomak bollaj j edit and delete jeno sudhu matro rajshahi.jibon@gmail ei user korte pare emon koro",
      },
      { property: "og:title", content: "Ludu Hisab — Dashboard" },
      { property: "og:description", content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Ami to tomak bollaj j edit and delete jeno sudhu matro rajshahi.jibon@gmail ei user korte pare emon koro" },

      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Player = { id: string; name: string };
type Match = { id: string; match_date: string; created_by_name: string | null };
type MatchResult = { match_id: string; player_id: string; position: number; fine_amount: number };
type Payment = DuePayment;
type Expense = { amount: number; expense_date: string; note: string | null; created_by_name: string | null };

function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expandedDueId, setExpandedDueId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("All-Time");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "leaderboard" | "money" | "chanasta" | "dues" | "analytics">("overview");
  const [loading, setLoading] = useState(true);
  const [moneyView, setMoneyView] = useState<"total" | "daily">("total");
  const [comparisonPlayer1Id, setComparisonPlayer1Id] = useState<string | null>(null);
  const [comparisonPlayer2Id, setComparisonPlayer2Id] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [pRes, mRes, mrRes, eRes, payRes] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("matches").select("*"),
        supabase.from("match_results").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("payments").select("*")
      ]);

      setPlayers(pRes.data || []);
      setMatches(mRes.data || []);
      setMatchResults(mrRes.data || []);
      setExpenses(eRes.data || []);
      setPayments(payRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const playerStats = useMemo(() => {
    return players.map(player => {
      const allMatches = matchResults.filter(mr => mr.player_id === player.id).length;
      return { ...player, totalMatches: allMatches };
    });
  }, [players, matchResults]);

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

  const dues = useMemo(
    () => computeDues(players, matches, matchResults, payments),
    [players, matches, matchResults, payments],
  );

  const dueTotals = useMemo(() => {
    const totalFine = dues.reduce((a, d) => a + d.totalFine, 0);
    const totalPaid = dues.reduce((a, d) => a + d.totalPaid, 0);
    const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
    return {
      totalFine,
      totalPaid,
      totalDue: totalFine - totalPaid,
      cashInHand: totalPaid - totalExpenses,
      expectedFund: totalFine - totalExpenses,
    };
  }, [dues, expenses]);

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

  const dailyContributions = useMemo(() => {
    const byDate: Record<string, Record<string, { fine: number; matches: number }>> = {};

    filteredData.matches.forEach(match => {
      const day = match.match_date;
      const results = filteredData.matchResults.filter(mr => mr.match_id === match.id);
      if (results.length === 0) return;
      if (!byDate[day]) byDate[day] = {};
      results.forEach(r => {
        const entry = byDate[day]![r.player_id] || { fine: 0, matches: 0 };
        entry.fine += r.fine_amount;
        entry.matches += 1;
        byDate[day]![r.player_id] = entry;
      });
    });

    return Object.entries(byDate)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, playerMap]) => {
        const list = Object.entries(playerMap)
          .map(([playerId, v]) => ({
            id: playerId,
            name: players.find(p => p.id === playerId)?.name || "Unknown",
            fine: v.fine,
            matches: v.matches,
          }))
          .sort((a, b) => b.fine - a.fine);
        return {
          date,
          total: list.reduce((acc, p) => acc + p.fine, 0),
          players: list,
        };
      });
  }, [filteredData, players]);



  const expenseSummary = useMemo(() => {
    const distinctDays = new Set(filteredData.expenses.map(e => e.expense_date)).size;
    const avgSpend = distinctDays > 0 ? periodStats.totalExpenses / distinctDays : 0;
    return {
      entryCount: filteredData.expenses.length,
      avgSpend
    };
  }, [filteredData, periodStats]);

  const winRateTrendData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return last6Months.map(month => {
      const monthStr = format(month, "MMM");
      const interval = { start: startOfMonth(month), end: endOfMonth(month) };
      
      const monthMatches = matches.filter(m => 
        isWithinInterval(parseISO(m.match_date), interval)
      );
      
      const data: any = { name: monthStr };
      
      players.forEach(player => {
        const playerMatches = matchResults.filter(mr => 
          mr.player_id === player.id && 
          monthMatches.some(m => m.id === mr.match_id)
        );
        
        const wins = playerMatches.filter(mr => mr.position === 1).length;
        data[player.name] = wins;
      });
      return data;
    });
  }, [matches, matchResults, players]);

  const h2hComparison = useMemo(() => {
    if (players.length < 2) return null;

    const playerMatchCounts = players.map(p => ({
      ...p,
      count: matchResults.filter(mr => mr.player_id === p.id).length
    })).sort((a, b) => b.count - a.count);

    const p1 = comparisonPlayer1Id 
      ? players.find(p => p.id === comparisonPlayer1Id) 
      : playerMatchCounts[0];
    
    const p2 = comparisonPlayer2Id 
      ? players.find(p => p.id === comparisonPlayer2Id) 
      : playerMatchCounts[1];

    if (!p1 || !p2 || p1.id === p2.id) return null;

    const commonMatches = matches.filter(m => {
      const participants = matchResults.filter(mr => mr.match_id === m.id);
      return participants.some(mr => mr.player_id === p1.id) && 
             participants.some(mr => mr.player_id === p2.id);
    });

    const p1Wins = commonMatches.filter(m => {
      const r1 = matchResults.find(mr => mr.match_id === m.id && mr.player_id === p1.id);
      const r2 = matchResults.find(mr => mr.match_id === m.id && mr.player_id === p2.id);
      return r1 && r2 && r1.position < r2.position;
    }).length;

    const p2Wins = commonMatches.length - p1Wins;

    const statsFor = (playerId: string) => {
      const results = matchResults.filter(mr => mr.player_id === playerId);
      return {
        matches: results.length,
        first: results.filter(r => r.position === 1).length,
        second: results.filter(r => r.position === 2).length,
        third: results.filter(r => r.position === 3).length,
        fourth: results.filter(r => r.position === 4).length,
        totalFine: results.reduce((acc, r) => acc + r.fine_amount, 0),
      };
    };

    return { p1, p2, p1Wins, p2Wins, commonCount: commonMatches.length, p1Stats: statsFor(p1.id), p2Stats: statsFor(p2.id) };
  }, [players, matches, matchResults, comparisonPlayer1Id, comparisonPlayer2Id]);

  const playerRankings = useMemo(
    () => computeRanking(players, filteredData.matchResults),
    [players, filteredData],
  );

  const bestPlayer = useMemo(() => getBestPlayer(playerRankings), [playerRankings]);

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
      <div className="relative flex p-1 bg-muted/30 rounded-2xl shrink-0 overflow-x-auto no-scrollbar">
        <div 
          className="absolute h-[calc(100%-8px)] bg-white rounded-xl shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out z-0"
          style={{
            width: `calc(14.28% - 2px)`,
            left: `calc(${['overview', 'matches', 'leaderboard', 'money', 'chanasta', 'dues', 'analytics'].indexOf(activeTab) * 14.28}% + 4px)`
          }}
        />
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'matches', label: 'Matches', icon: Dice5 },
          { id: 'leaderboard', label: 'Stats', icon: Trophy },
          { id: 'money', label: 'Money', icon: Users },
          { id: 'chanasta', label: 'Tea', icon: Coffee },
          { id: 'dues', label: 'Due', icon: HandCoins },
          { id: 'analytics', label: 'Insights', icon: TrendingUp },
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
                subValue="This Period"
              />
            </div>
            <StatCard 
              label="Total Cha-Nasta Expense" 
              value={`${periodStats.totalExpenses} ৳`} 
              icon={<Coffee className="h-4 w-4" />}
              variant="red"
            />

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Cash in Hand"
                value={`${dueTotals.cashInHand} ৳`}
                icon={<Wallet className="h-4 w-4" />}
                variant="green"
                subValue="Paid − Expenses"
              />
              <StatCard
                label="Total Due"
                value={`${dueTotals.totalDue} ৳`}
                icon={<HandCoins className="h-4 w-4" />}
                variant="red"
                subValue="All-Time"
              />
            </div>
            
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
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-foreground">Match Details</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{filteredData.matches.length} Total Matches Found</p>
              </div>
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
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                            <Dice5 className="h-3 w-3 text-ludu-gold" />
                            Match #{match.id.slice(0, 4)}
                          </div>
                          {match.created_by_name && (
                            <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                              By: {match.created_by_name}
                            </span>
                          )}
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
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-ludu-gold" />
                <h2 className="text-xl font-black text-foreground">Position Stats</h2>
              </div>
              <Link
                to="/players"
                className="flex items-center gap-1.5 rounded-xl bg-ludu-blue/10 px-3 py-2 text-[11px] font-black text-ludu-blue active-scale"
              >
                <Users className="h-3.5 w-3.5" /> Manage Players
              </Link>
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
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{matchResults.filter(mr => mr.player_id === player.id).length} Matches Played</p>
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
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-foreground">Fine Contributions</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : selectedMonth}
                </p>
              </div>
            </div>

            {/* Total / Individual switch */}
            <div className="flex p-1 bg-muted/30 rounded-2xl">
              <button
                onClick={() => setMoneyView("total")}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black transition-all active-scale",
                  moneyView === "total" ? "bg-white shadow-sm text-ludu-blue ring-1 ring-black/5" : "text-muted-foreground"
                )}
              >
                Total
              </button>
              <button
                onClick={() => setMoneyView("daily")}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black transition-all active-scale",
                  moneyView === "daily" ? "bg-white shadow-sm text-ludu-blue ring-1 ring-black/5" : "text-muted-foreground"
                )}
              >
                Individual (Day-wise)
              </button>
            </div>

            {moneyView === "total" ? (
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
                        {index === 0 ? "Biggest Contributor 💸" : (index === contributionLeaderboard.length - 1 && contributionLeaderboard.length > 1) ? "Luckiest Player 🎉" : `${matchResults.filter(mr => mr.player_id === player.id).length} Matches Played`}
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
            ) : (
              dailyContributions.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 text-center border-2 border-dashed border-muted text-muted-foreground font-bold">
                  No fines recorded for this period 🎲
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyContributions.map(day => (
                    <div key={day.date} className="rounded-3xl bg-white p-5 card-shadow border-2 border-muted space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-full">
                          {format(parseISO(day.date), "EEEE, MMM d, yyyy")}
                        </span>
                        <span className="text-sm font-black text-ludu-blue">{day.total} ৳</span>
                      </div>
                      <div className="space-y-2 pt-1 border-t border-dashed border-muted">
                        {day.players.map(p => (
                          <div key={p.id} className="flex items-center gap-3 pt-1">
                            <PlayerAvatar name={p.name} size="xs" />
                            <span className="font-bold text-xs flex-1 truncate">{p.name}</span>
                            <span className="text-[10px] font-black text-muted-foreground">{p.matches} match{p.matches > 1 ? "es" : ""}</span>
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-full",
                              p.fine > 0 ? "bg-ludu-red text-white" : "bg-ludu-green/10 text-ludu-green"
                            )}>
                              {p.fine} ৳
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
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
                <div className="pt-4 space-y-3">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Recent Expenses</h3>
                  <div className="space-y-2">
                    {filteredData.expenses
                      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
                      .slice(0, 5)
                      .map((exp, idx) => (
                        <div key={idx} className="bg-muted/20 rounded-2xl p-3 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xs font-black">{exp.amount} ৳</span>
                            <span className="text-[8px] font-bold text-muted-foreground">
                              {format(parseISO(exp.expense_date), "MMM d")} 
                              {exp.created_by_name ? ` • By ${exp.created_by_name}` : ''}
                            </span>
                          </div>
                          {exp.note && <span className="text-[9px] font-medium text-muted-foreground italic truncate max-w-[100px]">{exp.note}</span>}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'dues' && (
          <motion.div
            key="dues"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <HandCoins className="h-5 w-5 text-ludu-red" />
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-foreground">Due & Payment</h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">All-Time Hisab</p>
                </div>
              </div>
              <Link
                to="/add-payment"
                className="rounded-2xl bg-ludu-green text-white px-4 py-2.5 text-xs font-black shadow-lg shadow-ludu-green/20 active-scale"
              >
                + Payment
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white p-4 border-2 border-muted card-shadow text-center">
                <p className="text-lg font-black text-foreground">{dueTotals.totalFine} ৳</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Fine</p>
              </div>
              <div className="rounded-3xl bg-white p-4 border-2 border-ludu-green/20 card-shadow text-center">
                <p className="text-lg font-black text-ludu-green">{dueTotals.totalPaid} ৳</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Paid</p>
              </div>
              <div className="rounded-3xl bg-white p-4 border-2 border-ludu-red/20 card-shadow text-center">
                <p className="text-lg font-black text-ludu-red">{dueTotals.totalDue} ৳</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Due</p>
              </div>
            </div>

            <div className="space-y-3">
              {dues.map(player => {
                const open = expandedDueId === player.id;
                return (
                  <div key={player.id} className="rounded-3xl bg-white border-2 border-muted card-shadow overflow-hidden">
                    <button
                      onClick={() => setExpandedDueId(open ? null : player.id)}
                      className="w-full flex items-center gap-3 p-4 text-left active-scale"
                    >
                      <PlayerAvatar name={player.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-foreground truncate">{player.name}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          Fine {player.totalFine} ৳ · Paid {player.totalPaid} ৳
                        </p>
                      </div>
                      {player.due > 0 ? (
                        <span className="text-sm font-black text-ludu-red">{player.due} ৳</span>
                      ) : (
                        <span className="text-[9px] font-black bg-ludu-green/10 text-ludu-green px-2 py-1 rounded-full uppercase tracking-widest">
                          Clear
                        </span>
                      )}
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                    </button>

                    {open && (
                      <div className="border-t border-dashed border-muted p-4 space-y-2">
                        {player.ledger.length === 0 ? (
                          <p className="text-xs font-bold text-muted-foreground text-center py-2">No fine or payment yet 🎲</p>
                        ) : (
                          player.ledger.map((row, i) => (
                            <div key={`${row.date}-${row.type}-${i}`} className="flex items-center gap-2 text-xs">
                              <span className="font-black text-muted-foreground w-20 shrink-0">
                                {format(parseISO(row.date), "MMM d")}
                              </span>
                              <span className={cn(
                                "font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest",
                                row.type === "fine" ? "bg-ludu-red/10 text-ludu-red" : "bg-ludu-green/10 text-ludu-green"
                              )}>
                                {row.type === "fine" ? "Fine" : "Paid"} {row.amount} ৳
                              </span>
                              <span className="flex-1 truncate text-[10px] font-bold text-muted-foreground/70">{row.note || ""}</span>
                              <span className="font-black text-foreground">Due {row.runningDue} ৳</span>
                            </div>
                          ))
                        )}
                        <Link
                          to="/add-payment"
                          search={{ playerId: player.id }}
                          className="mt-2 flex w-full items-center justify-center rounded-2xl bg-ludu-green text-white font-black py-3 text-sm shadow-lg shadow-ludu-green/20 active-scale"
                        >
                          Pay {player.due > 0 ? `${player.due} ৳` : ""}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 px-1">
              <TrendingUp className="h-5 w-5 text-ludu-blue" />
              <h2 className="text-xl font-black text-foreground">Insights & Trends</h2>
            </div>

            {/* Win Rate Trend Chart */}
            <div className="rounded-3xl bg-white p-6 card-shadow border-2 border-muted">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">1st Place Wins (Count)</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={winRateTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    {players.map((player, idx) => (
                      <Line 
                        key={player.id}
                        type="monotone" 
                        dataKey={player.name} 
                        stroke={['#F5B301', '#2E9E4D', '#2D6CDF', '#E14545', '#8B5CF6', '#EC4899'][idx % 6] || '#000'} 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Head to Head Comparison */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Head-to-Head Comparison</h3>
              <div className="grid grid-cols-1 gap-4">
                {h2hComparison && (
                    <div className="rounded-3xl bg-white p-6 card-shadow border-2 border-muted">
                      {/* Explicit player selectors */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-ludu-gold uppercase tracking-widest px-1">Player 1</label>
                          <select
                            value={h2hComparison.p1.id}
                            onChange={(e) => {
                              const id = e.target.value;
                              if (id === h2hComparison.p2.id) setComparisonPlayer2Id(h2hComparison.p1.id);
                              setComparisonPlayer1Id(id);
                            }}
                            className="w-full h-11 px-3 rounded-2xl bg-ludu-gold/10 border-2 border-ludu-gold/40 text-sm font-black text-foreground outline-none appearance-none"
                          >
                            {players.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-ludu-blue uppercase tracking-widest px-1">Player 2</label>
                          <select
                            value={h2hComparison.p2.id}
                            onChange={(e) => {
                              const id = e.target.value;
                              if (id === h2hComparison.p1.id) setComparisonPlayer1Id(h2hComparison.p2.id);
                              setComparisonPlayer2Id(id);
                            }}
                            className="w-full h-11 px-3 rounded-2xl bg-ludu-blue/10 border-2 border-ludu-blue/40 text-sm font-black text-foreground outline-none appearance-none"
                          >
                            {players.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-8">
                        <div className="text-center space-y-2">
                          <PlayerAvatar name={h2hComparison.p1.name} size="md" className="ring-2 ring-ludu-gold ring-offset-2" />
                          <div className="flex flex-col">
                            <p className="font-black text-xs">{h2hComparison.p1.name}</p>
                            <span className="text-[8px] font-black text-muted-foreground uppercase">{h2hComparison.p1Stats.matches} Matches</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter mb-1">VS</span>
                          <div className="h-0.5 w-12 bg-muted rounded-full" />
                        </div>

                        <div className="text-center space-y-2">
                          <PlayerAvatar name={h2hComparison.p2.name} size="md" className="ring-2 ring-ludu-blue ring-offset-2" />
                          <div className="flex flex-col">
                            <p className="font-black text-xs">{h2hComparison.p2.name}</p>
                            <span className="text-[8px] font-black text-muted-foreground uppercase">{h2hComparison.p2Stats.matches} Matches</span>
                          </div>
                        </div>
                      </div>


                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                            <span>{h2hComparison.p1Wins} Wins</span>
                            <span>{h2hComparison.p2Wins} Wins</span>
                          </div>
                          <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-ludu-gold transition-all" 
                              style={{ width: `${h2hComparison.commonCount > 0 ? (h2hComparison.p1Wins / h2hComparison.commonCount) * 100 : 50}%` }}
                            />
                            <div 
                              className="h-full bg-ludu-blue transition-all" 
                              style={{ width: `${h2hComparison.commonCount > 0 ? (h2hComparison.p2Wins / h2hComparison.commonCount) * 100 : 50}%` }}
                            />
                          </div>
                          <p className="text-center text-[10px] font-bold text-muted-foreground pt-1">
                            Out of {h2hComparison.commonCount} common matches
                          </p>
                        </div>

                        {/* Detailed Stats Comparison */}
                        <div className="space-y-2 pt-2 border-t border-dashed border-muted">
                          {([
                            { label: "Matches Played", icon: "🎲", v1: h2hComparison.p1Stats.matches, v2: h2hComparison.p2Stats.matches },
                            { label: "1st Place 🥇", icon: "", v1: h2hComparison.p1Stats.first, v2: h2hComparison.p2Stats.first },
                            { label: "2nd Place 🥈", icon: "", v1: h2hComparison.p1Stats.second, v2: h2hComparison.p2Stats.second },
                            { label: "3rd Place 🥉", icon: "", v1: h2hComparison.p1Stats.third, v2: h2hComparison.p2Stats.third },
                            { label: "4th Place 4️⃣", icon: "", v1: h2hComparison.p1Stats.fourth, v2: h2hComparison.p2Stats.fourth },
                            { label: "Total Paid", icon: "💸", v1: `${h2hComparison.p1Stats.totalFine} ৳`, v2: `${h2hComparison.p2Stats.totalFine} ৳` },
                          ]).map(row => (
                            <div key={row.label} className="flex items-center justify-between px-2 py-2 rounded-2xl bg-muted/20">
                              <span className={cn(
                                "w-14 text-center text-sm font-black",
                                h2hComparison.p1.id === h2hComparison.p1.id && "text-ludu-gold"
                              )}>
                                {row.v1}
                              </span>
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center flex-1">
                                {row.icon} {row.label}
                              </span>
                              <span className="w-14 text-center text-sm font-black text-ludu-blue">
                                {row.v2}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* Player Ranking Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Player Ranking</h3>

              {/* Best Player Card */}
              {bestPlayer && (
                <Card className="border-2 border-ludu-gold/30 bg-gradient-to-br from-ludu-gold/15 to-ludu-gold/5 card-shadow overflow-hidden">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="relative">
                      <PlayerAvatar name={bestPlayer.name} size="lg" className="ring-4 ring-ludu-gold ring-offset-2" />
                      <span className="absolute -top-2 -right-2 text-xl">👑</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-ludu-gold uppercase tracking-widest">
                        {selectedDate ? "Best of the Day" : selectedMonth === "All-Time" ? "Best Player (All Time)" : `Best of ${selectedMonth}`}
                      </p>
                      <p className="text-lg font-black text-foreground truncate">{bestPlayer.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">
                        {bestPlayer.avgPoints.toFixed(2)} avg pts • {bestPlayer.matches} matches
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {([1, 2, 3, 4] as const).map(pos => (
                        <div key={pos} className="flex flex-col items-center">
                          <span className="text-xs">{["🥇", "🥈", "🥉", "4️⃣"][pos - 1]}</span>
                          <span className="text-[10px] font-black">{[bestPlayer.first, bestPlayer.second, bestPlayer.third, bestPlayer.fourth][pos - 1]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ranking List */}
              <Card className="border-2 border-muted/50 card-shadow overflow-hidden">
                <CardContent className="p-3 space-y-2">
                  {playerRankings.filter(r => r.matches > 0).map(r => (
                    <div
                      key={r.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-2xl",
                        r.rank === 1 && r.eligible ? "bg-ludu-gold/10 ring-1 ring-ludu-gold/30" : "bg-muted/20"
                      )}
                    >
                      <span className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                        r.rank === 1 && r.eligible ? "bg-ludu-gold text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {r.rank}
                      </span>
                      <PlayerAvatar name={r.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate flex items-center gap-1.5">
                          {r.name}
                          {r.rank === 1 && r.eligible && <span>👑</span>}
                          {!r.eligible && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                              ⚠️ কম ম্যাচ
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          {r.matches} matches • 🥇{r.first} 🥈{r.second} 🥉{r.third} 4️⃣{r.fourth}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-ludu-gold">{r.avgPoints.toFixed(2)}</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">avg pts</p>
                      </div>
                    </div>
                  ))}
                  {playerRankings.every(r => r.matches === 0) && (
                    <p className="text-center text-xs font-bold text-muted-foreground py-6">No matches in this period yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* How it works */}
              <Card className="border-2 border-muted/50 card-shadow overflow-hidden">
                <CardContent className="p-4 space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">কিভাবে হিসাব হয়</p>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4] as const).map(pos => (
                      <div key={pos} className="flex-1 rounded-xl bg-muted/20 py-2 flex flex-col items-center">
                        <span className="text-sm">{["🥇", "🥈", "🥉", "4️⃣"][pos - 1]}</span>
                        <span className="text-xs font-black">{POSITION_POINTS[pos]} pts</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                    Score = মোট পয়েন্ট ÷ মোট ম্যাচ। কম ম্যাচ খেললেও ভালো খেললে best হওয়া যায়। Best Player ক্রাউন পেতে কমপক্ষে {MIN_MATCHES_FOR_BEST} ম্যাচ খেলতে হবে। প্রতি মাসের ১ তারিখ থেকে হিসাব নতুন করে শুরু হয় — মাস ফিল্টার বদলে সেই মাসের best দেখুন।
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
