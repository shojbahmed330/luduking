import { useState, useEffect } from "react";
import { LogIn, Dice5, Trophy, Wallet, Coffee, Star, Mail, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton } from "./ludu/PrimaryButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Failed to sign in with Google. Check backend settings.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setIsEmailSent(true);
      toast.success("Magic link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setAuthLoading(false);
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

          <div className="w-full space-y-6 pt-4">
            {isEmailSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-ludu-gold/20 card-shadow"
              >
                <div className="h-12 w-12 bg-ludu-gold/10 rounded-2xl flex items-center justify-center text-ludu-gold mx-auto mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black mb-2 text-foreground">Check your email</h3>
                <p className="text-sm font-bold text-muted-foreground mb-4">
                  We've sent a login link to <span className="text-foreground">{email}</span>
                </p>
                <button 
                  onClick={() => setIsEmailSent(false)}
                  className="text-xs font-black text-ludu-gold uppercase tracking-widest hover:underline"
                >
                  Try a different email
                </button>
              </motion.div>
            ) : (
              <>
                <div className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-ludu-gold transition-colors" />
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 bg-white border-2 border-muted rounded-2xl pl-12 pr-4 text-sm font-bold focus:border-ludu-gold outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                    <PrimaryButton 
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-14 bg-ludu-gold text-white flex items-center justify-center gap-2 shadow-lg shadow-ludu-gold/20"
                    >
                      <span className="font-black">Login with Email</span>
                      <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  </form>

                  <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-muted" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">or</span>
                    <div className="h-px flex-1 bg-muted" />
                  </div>

                  <PrimaryButton 
                    onClick={handleGoogleLogin} 
                    disabled={authLoading}
                    className="w-full h-14 bg-white border-2 border-muted text-foreground flex items-center justify-center gap-3 hover:bg-muted/5 transition-all shadow-sm rounded-2xl group"
                  >
                    <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-muted group-active:scale-95 transition-transform shrink-0">
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                    </div>
                    <span className="font-black text-sm">Continue with Google</span>
                  </PrimaryButton>
                </div>
              </>
            )}
            
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