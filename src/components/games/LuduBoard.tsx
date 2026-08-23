import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LuduColor, Piece, getCoordinates } from '@/lib/ludu-engine';

interface LuduBoardProps {
  pieces: Piece[];
  onPieceClick?: (pieceId: string) => void;
  currentPlayerColor?: LuduColor;
  turnColor?: LuduColor;
}

export const LuduBoard: React.FC<LuduBoardProps> = ({ 
  pieces, 
  onPieceClick, 
  currentPlayerColor,
  turnColor
}) => {
  return (
    <div className="relative w-full aspect-square bg-[#F8F9F5] border-[6px] border-[#2C3E50] rounded-2xl overflow-hidden shadow-2xl">
      {/* Board Layout Grid */}
      <div className="grid grid-cols-15 grid-rows-15 h-full w-full bg-[#ECF0F1]">
        {Array.from({ length: 225 }).map((_, i) => {
          const row = Math.floor(i / 15);
          const col = i % 15;
          
          let bgColor = "";
          
          // Home Bases
          if (row < 6 && col < 6) bgColor = "bg-ludu-red/10";
          if (row < 6 && col > 8) bgColor = "bg-ludu-green/10";
          if (row > 8 && col < 6) bgColor = "bg-ludu-blue/10";
          if (row > 8 && col > 8) bgColor = "bg-ludu-gold/10";
          
          // Paths & Safety
          const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
          if (isCenter) bgColor = "bg-white";

          // Entry Arrows & Finish Path
          if (row === 7 && col > 0 && col < 6) bgColor = "bg-ludu-red/30";
          if (col === 7 && row > 0 && row < 6) bgColor = "bg-ludu-green/30";
          if (row === 7 && col > 8 && col < 14) bgColor = "bg-ludu-gold/30";
          if (col === 7 && row > 8 && row < 14) bgColor = "bg-ludu-blue/30";

          return (
            <div 
              key={i} 
              className={cn(
                "w-full h-full border-[0.5px] border-black/5 flex items-center justify-center", 
                bgColor
              )}
            >
              {/* Star icons for safety spots could go here */}
            </div>
          );
        })}
      </div>

      {/* Render Pieces */}
      {pieces.map((piece, idx) => {
        const coords = getCoordinates(piece.color, piece.position, idx % 4);
        const isMyTurn = piece.color === turnColor;
        const isClickable = isMyTurn && piece.color === currentPlayerColor;

        return (
          <motion.div
            key={piece.id}
            initial={false}
            animate={{ 
              left: `${(coords.x / 15) * 100}%`, 
              top: `${(coords.y / 15) * 100}%`,
              scale: isMyTurn ? 1.1 : 1
            }}
            whileHover={isClickable ? { scale: 1.2 } : {}}
            whileTap={isClickable ? { scale: 0.9 } : {}}
            onClick={() => isClickable && onPieceClick?.(piece.id)}
            className={cn(
              "absolute w-[5.5%] h-[5.5%] rounded-full border-2 border-white shadow-xl z-30 transition-shadow",
              piece.color === 'red' && "bg-ludu-red",
              piece.color === 'green' && "bg-ludu-green",
              piece.color === 'blue' && "bg-ludu-blue",
              piece.color === 'yellow' && "bg-ludu-gold",
              isClickable && "ring-4 ring-white/50 animate-pulse cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            )}
          />
        );
      })}
      
      {/* Center Home Area (Logo/Finish) */}
      <div className="absolute inset-[40%] bg-white border-4 border-[#2C3E50] rounded-xl flex items-center justify-center shadow-inner z-20">
        <div className="text-center">
          <div className="text-[8px] font-black uppercase text-[#2C3E50] tracking-tighter">Ludu</div>
          <div className="text-[12px] font-black text-ludu-gold">KING</div>
        </div>
      </div>
    </div>
  );
};

