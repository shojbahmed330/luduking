import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Position = 1 | 2 | 3 | 4;

interface PositionBadgeProps {
  position: Position;
  className?: string;
}

const positionConfig = {
  1: {
    label: "Ludu King",
    color: "bg-ludu-gold text-white",
    icon: "🥇",
  },
  2: {
    label: "Ludu Prince",
    color: "bg-ludu-green text-white",
    icon: "🥈",
  },
  3: {
    label: "Chaa Sponsor",
    color: "bg-ludu-blue text-white",
    icon: "🥉",
  },
  4: {
    label: "Nasta Sponsor",
    color: "bg-ludu-red text-white",
    icon: "4️⃣",
  },
};

export function PositionBadge({ position, className }: PositionBadgeProps) {
  const config = positionConfig[position];

  return (
    <Badge
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 text-sm font-bold border-none rounded-full",
        config.color,
        className
      )}
    >
      <span role="img" aria-label={config.label}>
        {config.icon}
      </span>
      {config.label}
    </Badge>
  );
}
