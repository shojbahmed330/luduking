import { Link, useLocation } from "@tanstack/react-router";
import { Home, PlusCircle, Coffee, History, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Add Match", icon: PlusCircle, to: "/add-match" },
  
  { label: "Add Expense", icon: Coffee, to: "/add-expense" },
  { label: "History", icon: History, to: "/history" },
];

export function BottomNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full glass-nav pb-[var(--sab)]">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground/60 transition-all hover:text-ludu-gold active-scale min-w-[72px] relative",
                isActive ? "text-ludu-gold" : ""
              )}
            >
              <item.icon className={cn("h-6 w-6 transition-transform", isActive ? "scale-110" : "")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter transition-opacity",
                isActive ? "opacity-100" : "opacity-60"
              )}>
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
        })}
      </div>
    </nav>
  );
}
