import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Plus, Coffee, History, HandCoins, Dice5, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const leftItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "History", icon: History, to: "/history" },
] as const;
const rightItems = [
  { label: "Payment", icon: HandCoins, to: "/add-payment" },
  { label: "Players", icon: Users, to: "/players" },
] as const;

const addActions = [
  { label: "Add Match", icon: Dice5, to: "/add-match", color: "bg-ludu-gold" },
  { label: "Add Expense", icon: Coffee, to: "/add-expense", color: "bg-ludu-blue" },
  { label: "Add Payment", icon: HandCoins, to: "/add-payment", color: "bg-ludu-green" },
] as const;

export function BottomNavBar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const renderItem = (item: { label: string; icon: typeof Home; to: string }) => {
    const isActive = location.pathname === item.to;
    return (
      <Link
        key={item.label}
        to={item.to}
        className={cn(
          "flex flex-col items-center justify-center gap-1 text-muted-foreground/60 transition-all hover:text-ludu-gold active-scale min-w-[60px] relative",
          isActive ? "text-ludu-gold" : ""
        )}
      >
        <item.icon className={cn("h-6 w-6 transition-transform", isActive ? "scale-110" : "")} />
        <span className={cn("text-[10px] font-black uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-60")}>
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute -top-1 w-8 h-1 bg-ludu-gold rounded-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="absolute bottom-[calc(6rem+var(--sab))] left-1/2 -translate-x-1/2 flex gap-3"
            >
              {addActions.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  onClick={() => setOpen(false)}
                  className="flex w-24 flex-col items-center gap-2 rounded-3xl bg-card p-3 card-shadow border-2 border-muted active-scale"
                >
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-white", a.color)}>
                    <a.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tight text-foreground">{a.label}</span>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 z-50 w-full glass-nav pb-[var(--sab)]">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {leftItems.map(renderItem)}
          <button
            aria-label="Add"
            onClick={() => setOpen((o) => !o)}
            className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-ludu-gold text-primary-foreground shadow-lg shadow-ludu-gold/40 ring-4 ring-background active-scale"
          >
            <Plus className={cn("h-8 w-8 transition-transform", open && "rotate-45")} />
          </button>
          {rightItems.map(renderItem)}
        </div>
      </nav>
    </>
  );
}
