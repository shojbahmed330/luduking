import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LuduColor, Piece } from '@/lib/ludu-engine';

interface LuduBoardProps {
  pieces: Piece[];
  onPieceClick?: (pieceId: string) => void;
  currentPlayerColor?: LuduColor;
}

export const LuduBoard: React.FC<LuduBoardProps> = ({ 
  pieces, 
  onPieceClick, 
  currentPlayerColor 
}) => {
  // Simple representation for now - 15x15 grid
  return (
    <div className="relative w-full aspect-square bg-white border-4 border-muted rounded-xl overflow-hidden shadow-inner">
      {/* Basic Ludu Board Grid Layout */}
      <div className="grid grid-cols-15 grid-rows-15 h-full w-full gap-[1px] bg-muted/20 p-0.5">
        {Array.from({ length: 225 }).map((_, i) => {
          const row = Math.floor(i / 15);
          const col = i % 15;
          
          // Color the corners (Home areas)
          let bgColor = "bg-white";
          if (row < 6 && col < 6) bgColor = "bg-ludu-red/20";
          if (row < 6 && col > 8) bgColor = "bg-ludu-green/20";
          if (row > 8 && col < 6) bgColor = "bg-ludu-blue/20";
          if (row > 8 && col > 8) bgColor = "bg-ludu-gold/20";
          
          // Path coloring
          if ((row === 7 && col > 0 && col < 7)) bgColor = "bg-ludu-red/40";
          if ((col === 7 && row > 0 && row < 7)) bgColor = "bg-ludu-green/40";
          if ((row === 7 && col > 7 && col < 14)) bgColor = "bg-ludu-gold/40";
          if ((col === 7 && row > 7 && row < 14)) bgColor = "bg-ludu-blue/40";

          return (
            <div 
              key={i} 
              className={cn("w-full h-full border-[0.5px] border-muted/10", bgColor)}
            />
          );
        })}
      </div>

      {/* Render Pieces */}
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          layoutId={piece.id}
          initial={false}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPieceClick?.(piece.id)}
          className={cn(
            "absolute w-[6%] h-[6%] rounded-full border-2 border-white shadow-md cursor-pointer z-20",
            piece.color === 'red' && "bg-ludu-red",
            piece.color === 'green' && "bg-ludu-green",
            piece.color === 'blue' && "bg-ludu-blue",
            piece.color === 'yellow' && "bg-ludu-gold"
          )}
          style={{
            // Simplified positioning for demo
            left: `${20 + (Math.random() * 60)}%`,
            top: `${20 + (Math.random() * 60)}%`
          }}
        />
      ))}
      
      {/* Center Home Area */}
      <div className="absolute inset-[40%] bg-white border-2 border-muted rounded-lg flex items-center justify-center card-shadow z-10">
        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Home</span>
      </div>
    </div>
  );
};
