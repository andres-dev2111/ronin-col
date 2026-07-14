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
import { GetTheLook } from "@/components/ronin/GetTheLook";
import { fetchProducts } from "@/lib/shopify";
import heroImg from "@/assets/ronin-hero.jpg";

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
      <GetTheLook heroImage={heroImg} heroAlt="Look Ronin urbano" handle="@RONIN.OFICIAL" />
      <LookbookTeaser />
    </SiteShell>
  );
}

