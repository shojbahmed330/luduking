import { createFileRoute } from "@tanstack/react-router";
import luduAsset from "@/assets/ludu-king-v2.html.asset.json";
import { motion } from "framer-motion";
import { Share2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Ludu Hisab — Ludu King Virtual Arena" },
      {
        name: "description",
        content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Ami just games section ta change korte bolchilam, but tumi history and index o edit korle kano? just answer dao tmi",
      },
      { property: "og:title", content: "Ludu Hisab — Ludu King Virtual Arena" },
      { property: "og:description", content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Ami just games section ta change korte bolchilam, but tumi history and index o edit korle kano? just answer dao tmi" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LuduKingGame,
});

function LuduKingGame() {
  const shareGame = () => {
    const url = window.location.origin + "/games";
    navigator.clipboard.writeText(url);
    toast.success("Game link copied!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] -mt-6 -mx-4 overflow-hidden rounded-t-3xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-muted z-10 shadow-sm">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => window.history.back()}
          className="h-9 w-9 bg-white rounded-full border border-muted flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ludu King</span>
          <span className="font-black text-sm">Virtual Arena</span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={shareGame}
          className="h-9 w-9 bg-ludu-gold rounded-full border border-white flex items-center justify-center text-white shadow-md"
        >
          <Share2 className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Game Frame */}
      <div className="flex-1 relative bg-[#2b1d14]">
        <iframe 
          src={luduAsset.url} 
          className="w-full h-full border-none shadow-inner"
          title="Ludu King"
          allow="autoplay; clipboard-write; fullscreen"
        />
      </div>

      {/* Mobile Interaction Tip */}
      <div className="px-4 py-2 bg-white/50 backdrop-blur-sm text-center border-t border-muted/20">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
          Tip: Play in landscape mode for a wider view 🎲
        </p>
      </div>
    </div>
  );
}
