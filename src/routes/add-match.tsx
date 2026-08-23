import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlayerAvatar } from "@/components/ludu/PlayerAvatar";
import { PrimaryButton } from "@/components/ludu/PrimaryButton";
import { PositionBadge, type Position } from "@/components/ludu/PositionBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { CalendarIcon, ChevronRight, ChevronLeft, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

const matchSearchSchema = z.object({
  editId: z.string().optional(),
});

export const Route = createFileRoute("/add-match")({
  validateSearch: (search) => matchSearchSchema.parse(search),
  component: AddMatch,
});

type Player = {
  id: string;
  name: string;
};

type Step = "date" | "players" | "positions" | "review";

function AddMatch() {
  const navigate = useNavigate();
  const { editId } = useSearch({ from: "/add-match" });
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date>(new Date());
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [ranking, setRanking] = useState<Player[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId);

  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select("id, name")
        .order("name");
      if (data) setAllPlayers(data);
      if (error) toast.error("Failed to load players");
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    async function fetchMatchToEdit() {
      if (!editId || allPlayers.length === 0) return;

      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*, match_results(*)")
        .eq("id", editId)
        .single();

      if (matchError || !match) {
        toast.error("Failed to load match for editing");
        setIsLoadingEdit(false);
        return;
      }

      setDate(parseISO(match.match_date));
      
      const sortedResults = [...match.match_results].sort((a, b) => a.position - b.position);
      const rankedPlayers = sortedResults.map(r => {
        const player = allPlayers.find(p => p.id === r.player_id);
        return player || { id: r.player_id, name: "Unknown" };
      });

      setSelectedPlayers(rankedPlayers);
      setRanking(rankedPlayers);
      setIsLoadingEdit(false);
      setStep("review"); // Go straight to review when editing
    }

    if (editId && allPlayers.length > 0) {
      fetchMatchToEdit();
    }
  }, [editId, allPlayers]);

  const togglePlayer = (player: Player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 6) {
        setSelectedPlayers([...selectedPlayers, player]);
      } else {
        toast.error("Maximum 6 players allowed");
      }
    }
  };

  const addToRanking = (player: Player) => {
    if (ranking.find((p) => p.id === player.id)) return;
    setRanking([...ranking, player]);
  };

  const removeFromRanking = (playerId: string) => {
    setRanking(ranking.filter((p) => p.id !== playerId));
  };

  const getFine = (index: number) => {
    const pos = index + 1;
    if (pos === 3) return 5;
    if (pos === 4) return 10;
    return 0;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (editId) {
        // UPDATE Existing Match
        const { error: matchError } = await supabase
          .from("matches")
          .update({
            match_date: format(date, "yyyy-MM-dd"),
          })
          .eq("id", editId);

        if (matchError) throw matchError;

        // Delete old results and insert new ones
        const { error: deleteError } = await supabase
          .from("match_results")
          .delete()
          .eq("match_id", editId);
          
        if (deleteError) throw deleteError;

        const results = ranking.map((player, index) => ({
          match_id: editId,
          player_id: player.id,
          position: index + 1,
          fine_amount: getFine(index),
        }));

        const { error: resultsError } = await supabase
          .from("match_results")
          .insert(results);

        if (resultsError) throw resultsError;

        toast.success("Match updated! 🎲");
      } else {
        // CREATE New Match
        const { data: match, error: matchError } = await supabase
          .from("matches")
          .insert({
            match_date: format(date, "yyyy-MM-dd"),
          })
          .select()
          .single();

        if (matchError) throw matchError;

        const results = ranking.map((player, index) => ({
          match_id: match.id,
          player_id: player.id,
          position: index + 1,
          fine_amount: getFine(index),
        }));

        const { error: resultsError } = await supabase
          .from("match_results")
          .insert(results);

        if (resultsError) throw resultsError;

        toast.success("Match saved! 🎲");
      }
      navigate({ to: editId ? "/history" : "/" });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save match: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEdit) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading Match...</div>;
  }


  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">Add Match</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })} className="text-muted-foreground">
          Cancel
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-between px-2">
        {(["date", "players", "positions", "review"] as Step[]).map((s, idx) => (
          <div
            key={s}
            className={cn(
              "h-2 flex-1 mx-1 rounded-full transition-colors",
              step === s ? "bg-primary" : idx < ["date", "players", "positions", "review"].indexOf(step) ? "bg-primary/40" : "bg-muted"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "date" && (
          <motion.div
            key="date"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Match Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-bold py-6 rounded-2xl",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <PrimaryButton onClick={() => setStep("players")}>
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </motion.div>
        )}

        {step === "players" && (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Select Participants ({selectedPlayers.length}/6)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {allPlayers.map((player) => {
                  const isSelected = !!selectedPlayers.find((p) => p.id === player.id);
                  return (
                    <Card
                      key={player.id}
                      onClick={() => togglePlayer(player)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-all border-2",
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-transparent"
                      )}
                    >
                      <PlayerAvatar name={player.name} className="h-8 w-8" />
                      <span className="font-bold">{player.name}</span>
                      {isSelected && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </Card>
                  );
                })}
              </div>
            </div>
            
            {selectedPlayers.length < 3 && (
              <p className="text-sm font-medium text-destructive text-center">
                Please select at least 3 players
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-6 rounded-2xl" onClick={() => setStep("date")}>
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <PrimaryButton
                className="flex-[2]"
                disabled={selectedPlayers.length < 3}
                onClick={() => {
                  setRanking([]);
                  setStep("positions");
                }}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === "positions" && (
          <motion.div
            key="positions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Tap players in finishing order
                </label>
                <p className="text-xs text-muted-foreground">1st tap = 1st place, and so on...</p>
              </div>

              {/* Ranking List */}
              <div className="space-y-2 min-h-[200px] border-2 border-dashed rounded-3xl p-4 bg-muted/30">
                {ranking.map((player, idx) => (
                  <motion.div
                    layout
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border"
                  >
                    <PositionBadge position={(idx + 1) as Position} className="w-28 justify-center shrink-0" />
                    <PlayerAvatar name={player.name} className="h-8 w-8" />
                    <span className="font-bold flex-1">{player.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFromRanking(player.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </motion.div>
                ))}
                {ranking.length < selectedPlayers.length && (
                  <div className="flex items-center justify-center h-20 text-muted-foreground text-sm font-medium">
                    Waiting for {selectedPlayers.length - ranking.length} more...
                  </div>
                )}
              </div>

              {/* Available Players */}
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedPlayers
                  .filter((p) => !ranking.find((rp) => rp.id === p.id))
                  .map((player) => (
                    <Button
                      key={player.id}
                      variant="outline"
                      className="rounded-full px-4 py-6 h-auto flex flex-col items-center gap-2 border-2 hover:border-primary hover:bg-primary/5"
                      onClick={() => addToRanking(player)}
                    >
                      <PlayerAvatar name={player.name} />
                      <span className="font-bold">{player.name}</span>
                    </Button>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-6 rounded-2xl" onClick={() => setStep("players")}>
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <PrimaryButton
                className="flex-[2]"
                disabled={ranking.length !== selectedPlayers.length}
                onClick={() => setStep("review")}
              >
                Review <ChevronRight className="ml-2 h-5 w-5" />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-extrabold">Final Review</h3>
                <p className="text-muted-foreground font-medium">{format(date, "PPP")}</p>
              </div>

              <div className="space-y-3">
                {ranking.map((player, idx) => {
                  const fine = getFine(idx);
                  return (
                    <Card key={player.id} className="p-4 flex items-center gap-3 border-none shadow-sm">
                      <PositionBadge position={(idx + 1) as Position} className="w-28 justify-center" />
                      <PlayerAvatar name={player.name} className="h-8 w-8" />
                      <div className="flex-1">
                        <p className="font-bold leading-tight">{player.name}</p>
                        <p className={cn("text-xs font-bold uppercase", fine > 0 ? "text-ludu-red" : "text-muted-foreground")}>
                          {fine > 0 ? `${fine} Taka Fine` : "No Fine"}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-6 rounded-2xl" onClick={() => setStep("positions")}>
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <PrimaryButton
                className="flex-[2]"
                disabled={isSubmitting}
                onClick={handleSave}
              >
                {isSubmitting ? "Saving..." : "Save Match 🎲"}
              </PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
