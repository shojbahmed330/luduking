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
    <div className="flex flex-col items-center justify-center pt-20 text-center">
      <div className="rounded-full bg-white p-6 shadow-xl mb-6 animate-bounce">
        <span className="text-6xl" aria-hidden="true">
          🎲
        </span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
        Ready for the next step
      </h1>
      <p className="text-lg text-muted-foreground">
        Visual design system established. Reusable components ready.
      </p>
    </div>
  );
}
