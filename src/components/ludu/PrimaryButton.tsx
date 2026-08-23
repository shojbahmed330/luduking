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
          "w-full rounded-[1.5rem] py-8 text-xl font-black transition-all shadow-xl active-scale min-h-[64px] bg-ludu-gradient-gold text-white border-b-4 border-ludu-gold/50 active:border-b-0 active:translate-y-[4px] tracking-wider uppercase",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}
