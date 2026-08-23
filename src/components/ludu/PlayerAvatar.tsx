import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  name: string;
  className?: string;
}

export function PlayerAvatar({ name, className }: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  
  // Deterministic background color based on name
  const bgColors = [
    "bg-ludu-gold",
    "bg-ludu-green",
    "bg-ludu-blue",
    "bg-ludu-red",
  ];
  const charCode = name.charCodeAt(0);
  const bgColor = bgColors[charCode % bgColors.length];

  return (
    <Avatar className={cn("h-10 w-10 border-2 border-white shadow-sm", className)}>
      <AvatarFallback className={cn("text-white font-bold", bgColor)}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
