import { Card, CardContent } from "@/components/ui/card";
import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <Card className={`overflow-hidden border-none shadow-sm transition-all hover:shadow-md ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        {icon && <div className="mb-2 text-2xl">{icon}</div>}
        <div className="text-3xl font-extrabold text-foreground">{value}</div>
        <div className="mt-1 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
