import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";

export function PrimaryButton({ className, children, ...props }: ButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="w-full"
    >
      <Button
        className={cn(
          "w-full rounded-2xl py-6 text-lg font-black transition-all shadow-lg active-scale min-h-[56px] bg-ludu-gold hover:bg-ludu-gold/90 text-white border-b-4 border-ludu-gold/50 active:border-b-0 active:translate-y-[2px]",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}
