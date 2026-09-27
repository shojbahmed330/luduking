import { Card, CardContent } from "@/components/ui/card";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  subValue?: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "gold" | "blue" | "green" | "red";
}

export function StatCard({ label, value, icon, className, subValue, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-card border-muted/50",
    gold: "bg-gradient-to-br from-ludu-gold/20 to-ludu-gold/5 border-ludu-gold/20",
    blue: "bg-gradient-to-br from-ludu-blue/20 to-ludu-blue/5 border-ludu-blue/20",
    green: "bg-gradient-to-br from-ludu-green/20 to-ludu-green/5 border-ludu-green/20",
    red: "bg-gradient-to-br from-ludu-red/20 to-ludu-red/5 border-ludu-red/20",
  };

  const textColors = {
    default: "text-ludu-gold",
    gold: "text-ludu-gold",
    blue: "text-ludu-blue",
    green: "text-ludu-green",
    red: "text-ludu-red",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card className={cn(
        "overflow-hidden border-2 card-shadow transition-all group active-scale inner-glow",
        variantStyles[variant],
        className
      )}>
        <CardContent className="flex flex-col items-center justify-center p-5 text-center relative">
          {icon && (
            <div className={cn(
              "mb-1 flex items-center justify-center transition-transform group-hover:scale-110",
              textColors[variant]
            )}>
              {icon}
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
            {subValue && (
              <div className="text-[10px] font-black text-muted-foreground -mt-1 mb-1">
                {subValue}
              </div>
            )}
          </div>
          <div className="mt-0.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-80">
            {label}
          </div>
          {trend && (
            <div className={cn(
              "mt-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ring-1 ring-inset",
              trend.isPositive 
                ? "bg-ludu-green/10 text-ludu-green ring-ludu-green/20" 
                : "bg-ludu-red/10 text-ludu-red ring-ludu-red/20"
            )}>
              {trend.value}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
