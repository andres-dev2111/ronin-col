import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/ronin/SiteShell";
import { ProductCard } from "@/components/ronin/ProductCard";
import { EmptyProducts } from "@/components/ronin/HomeSections";
import { fetchCollection, fetchProducts } from "@/lib/shopify";

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
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">Colección</p>
        <h1 className="text-display text-5xl md:text-7xl mb-10">
          {data?.title ?? titleFor(handle)}
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-card animate-pulse" />
            ))}
          </div>
        ) : (data?.products.length ?? 0) === 0 ? (
          <EmptyProducts />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {data!.products.map((p: import("@/lib/shopify").ShopifyProduct) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
