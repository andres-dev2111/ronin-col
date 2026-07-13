import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/ronin/SiteShell";
import {
  Hero,
  CategoryGrid,
  FeaturedProducts,
  PromoBanner,
  LookbookTeaser,
} from "@/components/ronin/HomeSections";
import { fetchProducts } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RONIN — Streetwear premium. Sin amo. Sin límites." },
      {
        name: "description",
        content:
          "Streetwear premium para hombres urbanos. Hoodies, camisetas oversize y sets con algodón 320GSM. Sin amo. Sin límites.",
      },
      { property: "og:title", content: "RONIN — Streetwear premium" },
      {
        property: "og:description",
        content: "Sin amo. Sin límites. Streetwear premium con algodón 320GSM.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts(8),
  });

  return (
    <SiteShell>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts products={products} />
      <PromoBanner />
      <LookbookTeaser />
    </SiteShell>
  );
}
