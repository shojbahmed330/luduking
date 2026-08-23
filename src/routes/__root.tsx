import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Toaster } from "@/components/ui/sonner";

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
      { name: "description", content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Comparism a just dui joner nam kano? jar sathe jar icche comparism kora jabe, name select korle tader majhe comparism hobe. And Finally koita match khelche eitao thabe kintu sob jaigai. Total match" },
      { name: "author", content: "Ludu Friends" },
      { name: "theme-color", content: "#F8F9F5" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { property: "og:title", content: "Ludu Hisab" },
      { property: "og:description", content: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            For the code present, I get the error below.\n\nPlease think step-by-step in order to resolve it.\n```\nRendered more hooks than during the previous render.\n\n{\n  \"timestamp\": 1787513669771,\n  \"error_type\": \"RUNTIME_ERROR\",\n  \"filename\": \"/\",\n  \"lineno\": 0,\n  \"colno\": 0,\n  \"stack\": \"Error: Rendered more hooks than during the previous render.\\n    at updateWorkInProgressHook (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:4325:12)\\n    at updateMemo (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:4942:15)\\n    at Object.useMemo (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:13272:13)\\n    at exports.useMemo (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react.js?v=2aac3fea:736:31)\\n    at Dashboard (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/src/routes/index.tsx?t=1787513642637&tsr-split=component:1351:18)\\n    at Object.react_stack_bottom_frame (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:12864:12)\\n    at renderWithHooks (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:4211:19)\\n    at updateFunctionComponent (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:5567:16)\\n    at beginWork (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:6138:20)\\n    at runWithFiberInDEV (https://7b669899-b6c4-4bbd-bde3-300af79db27b.lovableproject.com/node_modules/.vite/deps/react-dom_client.js?v=2aac3fea:850:66)\",\n  \"has_blank_screen\": true\n}\n```" },
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background pb-[calc(4rem+var(--sab))] pt-[var(--sat)]">
        <header className="sticky top-0 z-40 w-full glass-header px-6 py-4 pt-[calc(0.5rem+var(--sat))]">
          <div className="flex items-center gap-2">
            <span className="text-2xl active-scale" role="img" aria-label="dice">
              🎲
            </span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Ludu Hisab</span>
          </div>
        </header>
        <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
        <BottomNavBar />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
