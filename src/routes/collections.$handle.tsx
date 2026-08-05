import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/ronin/SiteShell";
import { ProductCard } from "@/components/ronin/ProductCard";
import { EmptyProducts, CategoryGrid } from "@/components/ronin/HomeSections";
import { fetchCollection, fetchProducts } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$handle")({
  head: ({ params }) => {
    const title = titleFor(params.handle);
    return {
      meta: [
        { title: `${title} — RONIN` },
        {
          name: "description",
          content: `Explora la colección ${title} de RONIN. Streetwear premium con actitud.`,
        },
        { property: "og:title", content: `${title} — RONIN` },
        {
          property: "og:description",
          content: `Colección ${title} — Streetwear premium RONIN.`,
        },
      ],
    };
  },
  component: CollectionPage,
});

function titleFor(handle: string) {
  const map: Record<string, string> = {
    all: "Todos los productos",
    "best-sellers": "Más vendidos",
    "camisetas-oversize": "Camisetas Oversize",
    hoodies: "Hoodies",
    "sets-ronin": "Sets Ronin",
    "new-arrivals": "Nuevo",
  };
  return map[handle] ?? handle.replace(/-/g, " ");
}

function CollectionPage() {
  const { handle } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["collection", handle],
    queryFn: async () => {
      const col = await fetchCollection(handle);
      if (col?.products?.edges?.length) return { title: col.title, products: col.products.edges };
      // fallback: show all products if collection missing
      const all = await fetchProducts(24);
      return { title: titleFor(handle), products: all };
    },
  });

  return (
    <SiteShell>
      {handle === "all" && <CategoryGrid />}
      <div className="w-full py-8 md:py-12">
        <div className="px-2 md:px-3 mb-6">
          <p className="text-primary text-[10px] uppercase tracking-[0.3em] mb-1">Colección</p>
          <h1 className="text-display text-3xl md:text-5xl">
            {data?.title ?? titleFor(handle)}
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-card animate-pulse" />
            ))}
          </div>
        ) : (data?.products.length ?? 0) === 0 ? (
          <div className="px-4"><EmptyProducts /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-1.5">
            {data!.products.map((p: import("@/lib/catalog").CatalogProductEdge) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </div>

    </SiteShell>
  );
}
