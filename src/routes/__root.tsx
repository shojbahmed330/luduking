import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Dice5 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Toaster } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: "Ludu Hisab" },
      { name: "description", content: "Shared Ludu score and expense tracker — matches, fines, dues and tea fund." },
      { name: "author", content: "Ludu Friends" },
      { name: "theme-color", content: "#131722" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { property: "og:title", content: "Ludu Hisab" },
      { property: "og:description", content: "Shared Ludu score and expense tracker — matches, fines, dues and tea fund." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthStatus() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="mr-0.5 flex flex-col items-end">
        <span className="max-w-[88px] truncate text-[11px] font-extrabold on-gold">
          {(user.user_metadata?.["full_name"] as string) || user.email?.split('@')[0]}
        </span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="on-gold-soft flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-opacity hover:opacity-80"
        >
          <LogOut className="h-3 w-3" /> Logout
        </button>
      </div>
      {user.user_metadata?.["avatar_url"] ? (
        <img
          src={user.user_metadata["avatar_url"]}
          alt="Avatar"
          className="h-9 w-9 rounded-full border-2 border-white/70 shadow-sm"
        />
      ) : (
        <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-white/70 bg-white/25 text-xs font-black on-gold">
          {user.email?.[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background pb-[calc(4rem+var(--sab))]">
        <header
          className={cn(
            "brand-header sticky top-0 z-40 w-full transition-all duration-200",
            scrolled
              ? "pb-1.5 pt-[calc(0.25rem+var(--sat))]"
              : "pb-3 pt-[calc(0.75rem+var(--sat))]",
          )}
        >
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/25 shadow-sm active-scale">
                <Dice5 className="on-gold h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className={cn("truncate font-extrabold on-gold transition-all duration-200", scrolled ? "text-base" : "text-xl")}>
                  Ludu Hisab
                </p>
                <p className={cn("on-gold-soft text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200", scrolled ? "hidden" : "block")}>
                  Score · Fines · Tea Fund
                </p>
              </div>
            </div>
            <AuthStatus />
          </div>
        </header>
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-6 pt-4">
          <AuthGuard>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </AuthGuard>
        </main>
        <BottomNavBar />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
