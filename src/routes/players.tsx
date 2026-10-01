import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Pencil, Trash2, Check, X, Users, Archive, ArchiveRestore } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Players — Ludu Hisab" },
      {
        name: "description",
        content: "Add new players to the group so their matches, fines and dues are tracked everywhere automatically.",
      },
      { property: "og:title", content: "Players — Ludu Hisab" },
      {
        property: "og:description",
        content: "Add new players to the group so their matches, fines and dues are tracked everywhere automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayersPage,
});

type Player = { id: string; name: string; created_at: string; is_archived?: boolean | null };
type Stat = { matches: number; fines: number };

function PlayersPage() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    const [{ data: playerData }, { data: resultData }] = await Promise.all([
      supabase.from("players").select("*").order("created_at", { ascending: true }),
      supabase.from("match_results").select("player_id, fine_amount"),
    ]);

    const map: Record<string, Stat> = {};
    (resultData || []).forEach((r) => {
      const s = map[r.player_id] || { matches: 0, fines: 0 };
      s.matches += 1;
      s.fines += r.fine_amount || 0;
      map[r.player_id] = s;
    });

    setPlayers((playerData as Player[]) || []);
    setStats(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      toast.error("Please write a name");
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error("This player already exists");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("players").insert({ name });
    setSaving(false);

    if (error) {
      toast.error("Could not add player");
      return;
    }
    toast.success(`${name} added! 🎲`);
    setNewName("");
    load();
  };

  const handleRename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    const { error } = await supabase.from("players").update({ name }).eq("id", id);
    if (error) {
      toast.error("Could not rename player");
      return;
    }
    toast.success("Name updated");
    setEditingId(null);
    load();
  };

  const handleDelete = async (player: Player) => {
    const stat = stats[player.id];
    if (stat && stat.matches > 0) {
      toast.error("This player already has match records and cannot be removed");
      return;
    }
    if (!confirm(`Remove ${player.name}?`)) return;
    const { error } = await supabase.from("players").delete().eq("id", player.id);
    if (error) {
      toast.error("Could not remove player");
      return;
    }
    toast.success("Player removed");
    load();
  };

  const handleToggleArchive = async (player: Player) => {
    const next = !player.is_archived;
    const { error } = await supabase.from("players").update({ is_archived: next }).eq("id", player.id);
    if (error) {
      toast.error("Could not update player");
      return;
    }
    toast.success(next ? `${player.name} archived — hidden from new matches` : `${player.name} is active again`);
    load();
  };

  const activePlayers = players.filter((p) => !p.is_archived);
  const archivedPlayers = players.filter((p) => p.is_archived);

  return (
    <AuthGuard>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 pb-28"
      >
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm font-black text-muted-foreground active-scale w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-ludu-blue/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-ludu-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Players</h1>
            <p className="text-xs font-bold text-muted-foreground">
              New name added here shows up in matches, dues and stats automatically.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-3xl border-2 border-muted bg-card p-4 card-shadow">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            New Player Name
          </label>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sadaf"
              className="flex-1 rounded-2xl border-2 border-muted bg-background px-4 py-3 text-base font-black outline-none focus:border-ludu-gold"
            />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-2xl bg-ludu-gold px-5 text-white font-black shadow-lg active-scale disabled:opacity-50"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          {loading && <div className="h-20 rounded-3xl bg-muted/30 animate-pulse" />}
          {!loading && players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-3xl border-2 border-muted bg-card p-3 card-shadow"
            >
              <PlayerAvatar name={player.name} size="sm" />
              {editingId === player.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-xl border-2 border-muted px-3 py-2 font-black outline-none focus:border-ludu-gold"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground truncate">{player.name}</p>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {stats[player.id]?.matches || 0} matches · {stats[player.id]?.fines || 0} ৳ fines
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center gap-1">
                  {editingId === player.id ? (
                    <>
                      <button
                        onClick={() => handleRename(player.id)}
                        className="h-9 w-9 rounded-xl bg-ludu-green/10 text-ludu-green flex items-center justify-center active-scale"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="h-9 w-9 rounded-xl bg-muted/40 text-muted-foreground flex items-center justify-center active-scale"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(player.id);
                          setEditName(player.name);
                        }}
                        className="h-9 w-9 rounded-xl bg-ludu-blue/10 text-ludu-blue flex items-center justify-center active-scale"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(player)}
                        className="h-9 w-9 rounded-xl bg-ludu-red/10 text-ludu-red flex items-center justify-center active-scale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </AuthGuard>
  );
}
