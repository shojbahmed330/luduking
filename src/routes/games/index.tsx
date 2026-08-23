import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Gamepad2, Plus, Users, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { toast } from "sonner";

export const Route = createFileRoute("/games/")({
  component: GamesLobby,
});

function GamesLobby() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    fetchRooms();
  }, []);

  async function fetchRooms() {
    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("status", "waiting")
      .order("created_at", { ascending: false });
    
    if (!error) setRooms(data || []);
    setLoading(false);
  }

  async function createRoom() {
    if (!user) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("game_rooms")
        .insert({
          created_by: user.id,
          status: "waiting",
          players_data: [{
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split("@")[0],
            color: "red",
            joined_at: new Date().toISOString()
          }]
        })
        .select()
        .single();

      if (error) throw error;
      navigate({ to: `/games/$roomId`, params: { roomId: data.id } });
    } catch (error: any) {
      toast.error("Failed to create room: " + error.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-ludu-gold" />
          <h1 className="text-2xl font-black tracking-tight">Game Lobby</h1>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-6 border-2 border-muted card-shadow space-y-4"
      >
        <div className="space-y-2">
          <h2 className="text-lg font-black">Start a New Game</h2>
          <p className="text-sm text-muted-foreground font-bold">Create a room and invite your friends to play Ludu King style.</p>
        </div>
        <PrimaryButton 
          onClick={createRoom} 
          disabled={creating}
          className="w-full bg-ludu-gold text-white flex items-center justify-center gap-2 py-6 rounded-2xl shadow-lg shadow-ludu-gold/20"
        >
          {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          <span className="text-lg font-black uppercase tracking-wider">Create Private Room</span>
        </PrimaryButton>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Waiting for Players</h3>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
            <p className="text-sm text-muted-foreground font-bold">No active rooms found.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rooms.map(room => (
              <motion.div 
                key={room.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: `/games/$roomId`, params: { roomId: room.id } })}
                className="bg-white p-4 rounded-2xl border-2 border-muted shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/30 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-black text-sm">Room #{room.id.slice(0, 6)}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                      {room.players_data.length} Players Waiting
                    </div>
                  </div>
                </div>
                <Play className="h-5 w-5 text-ludu-gold" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}