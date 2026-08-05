import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/ronin/SiteShell";
import {
  Hero,
  CategoryGrid,
  FeaturedProducts,
  PromoBanner,
  OversizeCarousel,
  LookbookTeaser,
  MediumPromoBanner,
} from "@/components/ronin/HomeSections";
import { fetchProducts } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RONIN — Streetwear premium. Sin límites." },
      {
        name: "description",
        content:
          "Streetwear premium para hombres urbanos. Hoodies, camisetas oversize y sets con calidad premium. Sin límites.",
      },
      { property: "og:title", content: "RONIN — Streetwear premium. Sin límites." },
      {
        property: "og:description",
        content: "Streetwear premium para hombres urbanos. Hoodies, camisetas oversize y sets con calidad premium. Sin límites.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: featured = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts(12),
  });

  const { data: oversize = [] } = useQuery({
    queryKey: ["products", "oversize"],
    queryFn: () => fetchProducts(12, "tag:oversize OR title:oversize"),
  });

  return (
    <SiteShell>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts products={featured} />
      <PromoBanner />
      <OversizeCarousel products={oversize.length ? oversize : featured} />
      <LookbookTeaser />
      <MediumPromoBanner />
    </SiteShell>
  );
}
