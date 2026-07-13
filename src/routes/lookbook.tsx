import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook — RONIN" },
      { name: "description", content: "La comunidad Ronin: outfits, looks y actitud." },
      { property: "og:title", content: "Lookbook — RONIN" },
      { property: "og:description", content: "Outfits, looks y actitud de la comunidad Ronin." },
    ],
  }),
  component: Lookbook,
});

const FILTERS = ["Todos", "Street", "Dark", "Raw", "Oversize"];

const LOOKS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  name: ["Look Street", "Look Dark", "Look Raw", "Look Oversize"][i % 4],
  tag: ["Street", "Dark", "Raw", "Oversize"][i % 4],
  gradient: [
    "from-zinc-800 to-black",
    "from-red-950 to-black",
    "from-neutral-900 to-black",
    "from-stone-900 to-black",
  ][i % 4],
}));

function Lookbook() {
  const [filter, setFilter] = useState("Todos");
  const visible = filter === "Todos" ? LOOKS : LOOKS.filter((l) => l.tag === filter);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">La comunidad</p>
        <h1 className="text-display text-5xl md:text-7xl mb-4">Lookbook</h1>
        <p className="text-muted-foreground max-w-xl mb-10">
          Tócalos para descubrir los productos que componen cada outfit.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-xs uppercase tracking-wider border transition",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((look) => (
            <button
              key={look.id}
              className={cn(
                "group relative aspect-[3/4] overflow-hidden border border-border bg-gradient-to-b",
                look.gradient,
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(200,16,46,0.2),transparent_60%)]" />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {look.tag}
                </span>
                <div>
                  <h3 className="text-display text-2xl md:text-3xl group-hover:text-primary transition">
                    {look.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider mt-1 text-primary opacity-0 group-hover:opacity-100 transition">
                    Get the look →
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
