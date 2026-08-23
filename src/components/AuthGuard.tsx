import { useState, useEffect } from "react";
import { LogIn, Dice5, Trophy, Wallet, Coffee, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton } from "./ludu/PrimaryButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-ludu-gold/20 border-t-ludu-gold rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Dice5 className="h-6 w-6 text-ludu-gold animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading Game Data...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] gap-8 px-6 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-ludu-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-ludu-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm flex flex-col items-center text-center space-y-8 z-10"
        >
          {/* Logo/Icon Container */}
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-20px] border border-dashed border-ludu-gold/20 rounded-full"
            />
            <div className="h-24 w-24 bg-gradient-to-br from-ludu-gold to-ludu-gold/80 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-ludu-gold/30 active-scale transition-transform">
              <Dice5 className="h-12 w-12" />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 h-8 w-8 bg-ludu-red rounded-full flex items-center justify-center text-white border-4 border-background shadow-lg"
            >
              <Trophy className="h-4 w-4" />
            </motion.div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              Ludu Hisab
            </h1>
            <p className="text-muted-foreground font-bold leading-relaxed px-4">
              Track matches, manage expenses, and see who's the ultimate King.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <PrimaryButton 
              onClick={handleGoogleLogin} 
              className="w-full h-16 bg-white border-2 border-muted text-foreground flex items-center justify-center gap-4 hover:bg-muted/5 transition-all shadow-xl shadow-black/[0.03] rounded-2xl group"
            >
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-muted group-active:scale-95 transition-transform">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
              </div>
              <span className="font-black text-lg">Continue with Google</span>
            </PrimaryButton>
            
            <div className="flex items-center justify-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pt-4 opacity-50">
              <span className="flex items-center gap-1.5"><Wallet className="h-3 w-3" /> Fines</span>
              <span className="h-1 w-1 bg-muted-foreground rounded-full" />
              <span className="flex items-center gap-1.5"><Coffee className="h-3 w-3" /> Snacks</span>
              <span className="h-1 w-1 bg-muted-foreground rounded-full" />
              <span className="flex items-center gap-1.5"><Star className="h-3 w-3" /> Stats</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Icons Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[20%] left-[15%]"><Dice5 className="h-12 w-12" /></motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-[25%] right-[20%]"><Coffee className="h-12 w-12" /></motion.div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[40%] right-[10%]"><Star className="h-12 w-12" /></motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}