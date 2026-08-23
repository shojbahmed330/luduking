import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";

export function PrimaryButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "w-full rounded-2xl py-7 text-lg font-bold transition-all active:scale-[0.98] active:brightness-95 shadow-md min-h-[56px]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
