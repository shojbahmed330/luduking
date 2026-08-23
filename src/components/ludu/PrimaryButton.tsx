import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ButtonProps } from "@/components/ui/button";

export function PrimaryButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "w-full rounded-2xl py-6 text-lg font-bold transition-transform active:scale-95 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
