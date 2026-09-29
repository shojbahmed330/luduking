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
import { ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import brandLogo from "@/assets/ludu-king-logo.png";
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
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
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

  const name = (user.user_metadata?.["full_name"] as string | undefined) || user.email?.split("@")[0] || "Player";
  const avatarUrl = user.user_metadata?.["avatar_url"] as string | undefined;
  const avatar = avatarUrl ? (
    <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
  ) : (
    <span className="text-sm font-black text-primary-foreground">{name.charAt(0).toUpperCase()}</span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Open profile menu" className="group h-12 min-w-0 max-w-[45%] gap-2 rounded-md border border-primary-foreground/15 bg-primary-foreground/10 px-2 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:ring-primary-foreground">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-foreground/30 bg-primary-foreground/15 shadow-sm">{avatar}</span>
          <span className="hidden min-w-0 flex-col items-start sm:flex">
            <span className="w-full truncate text-xs font-extrabold leading-tight">{name}</span>
            <span className="text-[10px] font-semibold leading-tight opacity-70">My profile</span>
          </span>
          <ChevronDown className="hidden h-3 w-3 shrink-0 opacity-70 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(19rem,calc(100vw-2rem))] rounded-md border-border bg-popover p-2 shadow-xl">
        <DropdownMenuLabel className="flex items-center gap-3 px-2 py-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/15 text-primary">{avatarUrl ? avatar : <span className="text-sm font-black">{name.charAt(0).toUpperCase()}</span>}</span>
          <span className="min-w-0 flex flex-col">
            <span className="truncate text-base font-extrabold text-foreground">{name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void supabase.auth.signOut()} className="min-h-11 cursor-pointer gap-2 rounded-md px-3 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
           <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4">
             <Link to="/" aria-label="Ludu Hisab home" className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground">
               <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-primary-foreground/20 bg-primary-foreground/10 shadow-sm transition-all duration-200", scrolled ? "h-10 w-10" : "h-12 w-12")}>
                 <img src={brandLogo} alt="" className="h-full w-full object-contain p-0.5 drop-shadow-sm" />
               </span>
               <span className="min-w-0">
                 <span className={cn("block truncate font-extrabold leading-none text-primary-foreground transition-all duration-200", scrolled ? "text-base" : "text-xl")}>
                   Ludu Hisab
                 </span>
                 <span className={cn("mt-1 block truncate text-[10px] font-bold uppercase text-primary-foreground/75 transition-all duration-200", scrolled ? "hidden" : "block")}>
                   Score · Fines · Tea Fund
                 </span>
               </span>
             </Link>
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
