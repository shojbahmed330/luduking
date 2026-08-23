import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({ name, className, size = "md" }: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16 text-2xl",
  };

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
    <Avatar className={cn(sizeClasses[size], "border-2 border-white shadow-sm", className)}>
      <AvatarFallback className={cn("text-white font-black", bgColor)}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
