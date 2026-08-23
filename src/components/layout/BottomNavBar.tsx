import { Link } from "@tanstack/react-router";
import { Home, PlusCircle, Coffee, LayoutDashboard, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Add Match", icon: PlusCircle, to: "/add-match" },
  { label: "Add Expense", icon: Coffee, to: "#" },
  { label: "Dashboard", icon: LayoutDashboard, to: "#" },
  { label: "History", icon: History, to: "#" },
];

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-white/80 backdrop-blur-md pb-safe">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={({ isActive }) => 
              cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary active:scale-90",
                isActive ? "text-primary" : ""
              )
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
