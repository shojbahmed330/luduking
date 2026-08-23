import { useState, useEffect } from "react";
import { LogIn, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { PrimaryButton } from "./ludu/PrimaryButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-ludu-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm bg-white rounded-3xl p-8 border-2 border-muted card-shadow text-center space-y-6"
        >
          <div className="h-16 w-16 bg-ludu-gold/10 rounded-2xl flex items-center justify-center text-ludu-gold mx-auto">
            <LogIn className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Sign In Required</h2>
            <p className="text-sm font-bold text-muted-foreground truncate">
              Connect to access Ludu Hisab
            </p>
          </div>

          <div className="space-y-4">
            <PrimaryButton 
              onClick={handleGoogleLogin} 
              className="w-full bg-white border-2 border-muted text-foreground flex items-center justify-center gap-2 hover:bg-muted/10"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
              <span>Connect with Google</span>
            </PrimaryButton>
            
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Secured by Lovable Cloud
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
