import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludu Hisab — Score & Fund Tracker" },
      {
        name: "description",
        content:
          "Ludu Hisab tracks Ludu match results, fines and shared cha-nasta expenses for a group of six friends.",
      },
      { property: "og:title", content: "Ludu Hisab — Score & Fund Tracker" },
      {
        property: "og:description",
        content:
          "Track Ludu match results, fines and shared cha-nasta expenses in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-5xl" aria-hidden="true">
        🎲
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Ludu Hisab</h1>
      <p className="mt-2 text-sm text-muted-foreground">Setup Complete — Database Ready</p>
    </main>
  );
}
