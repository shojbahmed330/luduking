import { useState, useEffect } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton } from "./ludu/PrimaryButton";
import { cn } from "@/lib/utils";

const GROUP_PASSWORD = "ludu"; // The secret

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem("ludu_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleAuth = () => {
    if (password.toLowerCase() === GROUP_PASSWORD) {
      localStorage.setItem("ludu_auth", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (loading) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 border-2 border-muted card-shadow text-center space-y-6"
      >
        <div className="h-16 w-16 bg-ludu-gold/10 rounded-2xl flex items-center justify-center text-ludu-gold mx-auto">
          <Lock className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">Restricted Access</h2>
          <p className="text-sm font-bold text-muted-foreground">Enter the group password to proceed.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Group Password"
              className={cn(
                "w-full px-6 py-4 rounded-2xl border-2 bg-muted/30 font-bold text-center transition-all focus:outline-none focus:ring-2 focus:ring-ludu-gold/20",
                error ? "border-ludu-red animate-shake" : "border-muted"
              )}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            {error && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black text-ludu-red uppercase tracking-widest mt-2 block"
              >
                Incorrect Password
              </motion.span>
            )}
          </div>
          
          <PrimaryButton onClick={handleAuth} className="w-full">
            Unlock
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}
