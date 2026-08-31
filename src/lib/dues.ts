export type DuePlayer = { id: string; name: string };
export type DueMatch = { id: string; match_date: string };
export type DueMatchResult = { match_id: string; player_id: string; fine_amount: number };
export type DuePayment = {
  id: string;
  player_id: string;
  amount: number;
  paid_date: string;
  note: string | null;
  created_by_name?: string | null;
};

export type LedgerEntry = {
  date: string;
  type: "fine" | "payment";
  amount: number;
  note?: string | null;
  runningDue: number;
};

export type PlayerDue = {
  id: string;
  name: string;
  totalFine: number;
  totalPaid: number;
  due: number;
  ledger: LedgerEntry[];
};

/**
 * Per-player hisab: total fines from matches, total payments made, and the
 * remaining due, plus a date-ordered ledger with a running due balance.
 */
export function computeDues(
  players: DuePlayer[],
  matches: DueMatch[],
  matchResults: DueMatchResult[],
  payments: DuePayment[],
): PlayerDue[] {
  const matchDate = new Map(matches.map((m) => [m.id, m.match_date]));

  return players
    .map((player) => {
      // Fines grouped per date
      const fineByDate: Record<string, number> = {};
      matchResults
        .filter((mr) => mr.player_id === player.id && mr.fine_amount > 0)
        .forEach((mr) => {
          const date = matchDate.get(mr.match_id);
          if (!date) return;
          fineByDate[date] = (fineByDate[date] || 0) + mr.fine_amount;
        });

      const playerPayments = payments.filter((p) => p.player_id === player.id);

      const rows: Omit<LedgerEntry, "runningDue">[] = [
        ...Object.entries(fineByDate).map(([date, amount]) => ({
          date,
          type: "fine" as const,
          amount,
          note: null,
        })),
        ...playerPayments.map((p) => ({
          date: p.paid_date,
          type: "payment" as const,
          amount: p.amount,
          note: p.note,
        })),
      ].sort((a, b) => {
        if (a.date === b.date) return a.type === "fine" ? -1 : 1;
        return a.date.localeCompare(b.date);
      });

      let running = 0;
      const ledger: LedgerEntry[] = rows.map((row) => {
        running += row.type === "fine" ? row.amount : -row.amount;
        return { ...row, runningDue: running };
      });

      const totalFine = Object.values(fineByDate).reduce((a, b) => a + b, 0);
      const totalPaid = playerPayments.reduce((a, p) => a + p.amount, 0);

      return {
        id: player.id,
        name: player.name,
        totalFine,
        totalPaid,
        due: totalFine - totalPaid,
        // newest first for display
        ledger: ledger.slice().reverse(),
      };
    })
    .sort((a, b) => b.due - a.due);
}
