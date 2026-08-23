import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Share2, Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";

export const Route = createFileRoute("/games/$roomId")({
  component: GameArena,
});

function GameArena() {
  const { roomId } = Route.useParams();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    fetchRoom();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`game_room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  async function fetchRoom() {
    // @ts-ignore
    const { data, error } = await (supabase
      .from("game_rooms" as any)
      .select("*")
      .eq("id", roomId)
      .single() as any);

    if (error) {
      toast.error("Game not found");
      return;
    }
    setRoom(data);
    setLoading(false);
  }

  const shareRoom = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Room link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-ludu-gold" />
        <p className="font-black text-muted-foreground uppercase tracking-widest">Entering Arena...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 h-full">
      <div className="flex items-center justify-between">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => window.history.back()}
          className="h-10 w-10 bg-white rounded-full border-2 border-muted flex items-center justify-center card-shadow"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Game Room</span>
          <span className="font-black text-sm">#{roomId.slice(0, 8)}</span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={shareRoom}
          className="h-10 w-10 bg-ludu-gold rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg shadow-ludu-gold/20"
        >
          <Share2 className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Placeholder for the Ludu Board */}
        <div className="w-full aspect-square max-w-[320px] bg-white rounded-3xl border-4 border-muted card-shadow p-2 relative overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-ludu-gold/5 via-transparent to-ludu-blue/5" />
          <div className="text-center z-10 space-y-4">
            <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">Game Board Loading</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Waiting for Players...</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[320px] space-y-4">
          <div className="bg-white rounded-2xl p-4 border-2 border-muted shadow-sm flex flex-col gap-3">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Players ({room.players_data.length}/4)</h3>
            <div className="flex flex-wrap gap-2">
              {room.players_data.map((player: any) => (
                <div key={player.id} className="flex items-center gap-2 bg-muted/20 px-3 py-2 rounded-xl border border-muted/50">
                  <div className={`h-2 w-2 rounded-full bg-${player.color}-500 shadow-sm`} />
                  <span className="text-xs font-black">{player.name}</span>
                </div>
              ))}
            </div>
          </div>

          <PrimaryButton 
            onClick={() => toast.info("Game engine coming in next phase!")}
            className="w-full py-5 rounded-2xl bg-ludu-green text-white shadow-lg shadow-ludu-green/20"
          >
            <span className="text-lg font-black uppercase tracking-wider">Start Match</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}