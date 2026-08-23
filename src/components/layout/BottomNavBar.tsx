import { Link, useLocation } from "@tanstack/react-router";
import { Home, PlusCircle, Coffee, History, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Add Match", icon: PlusCircle, to: "/add-match" },
  { label: "Games", icon: Gamepad2, to: "/games" },
  { label: "Add Expense", icon: Coffee, to: "/add-expense" },
  { label: "History", icon: History, to: "/history" },
];

export function BottomNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md glass-morphism rounded-[2.5rem] p-2 mb-[var(--sab)]">
      <div className="flex h-16 items-center justify-around px-2 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active-scale min-w-[64px] relative z-10",
                isActive ? "text-ludu-gold" : "text-muted-foreground/60"
              )}
            >
              <motion.div
                animate={isActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <item.icon className="h-6 w-6" />
              </motion.div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0 h-0"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="nav-pill-bg"
                  className="absolute inset-0 bg-ludu-gold/10 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
