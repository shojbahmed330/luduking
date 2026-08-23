import { Card, CardContent } from "@/components/ui/card";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "gold" | "blue" | "green" | "red";
}

export function StatCard({ label, value, icon, className, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-white",
    gold: "bg-ludu-gold/10 border-ludu-gold/20",
    blue: "bg-ludu-blue/10 border-ludu-blue/20",
    green: "bg-ludu-green/10 border-ludu-green/20",
    red: "bg-ludu-red/10 border-ludu-red/20",
  };

  return (
    <Card className={cn(
      "overflow-hidden border-2 shadow-sm transition-all hover:shadow-md",
      variantStyles[variant],
      className
    )}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        {icon && <div className={cn(
          "mb-2 text-2xl",
          variant !== "default" ? "text-foreground" : "text-muted-foreground"
        )}>{icon}</div>}
        <div className="text-3xl font-black text-foreground">{value}</div>
        <div className="mt-1 text-xs font-black text-muted-foreground uppercase tracking-widest">
          {label}
        </div>
        {trend && (
          <div className={cn(
            "mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
            trend.isPositive ? "bg-ludu-green/20 text-ludu-green" : "bg-ludu-red/20 text-ludu-red"
          )}>
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
