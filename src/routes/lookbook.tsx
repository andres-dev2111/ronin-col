import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { fetchProducts, formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Comunidad — Get the Look — RONIN" },
      { name: "description", content: "Outfits, looks y actitud de la comunidad Ronin. Get the look completo." },
      { property: "og:title", content: "Comunidad — Get the Look — RONIN" },
      { property: "og:description", content: "Compone tu look con la comunidad Ronin." },
    ],
  }),
  component: Community,
});

/** Editorial campaign photos (test images) */
const CAMPAIGNS = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1400&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1519058454-8f9d1e0a4a4a?w=1400&auto=format&fit=crop&q=75",
];

const HANDLES = ["@clarisse_vsr", "@mariaagi02", "@martinapaolini", "@mariacarballom"];

function Community() {
  const { data: products = [] } = useQuery({
    queryKey: ["products", "community"],
    queryFn: () => fetchProducts(12),
  });

  const looks = CAMPAIGNS.map((img, i) => ({
    id: i,
    image: img,
    handle: HANDLES[i % HANDLES.length],
    items: products.slice(i * 2, i * 2 + 3),
  }));

  return (
    <SiteShell>
      {/* Intro */}
      <section className="mx-auto max-w-[1600px] px-4 md:px-8 pt-12 md:pt-16 pb-8 text-center">
        <p className="text-primary text-xs uppercase tracking-[0.35em] mb-3">La comunidad</p>
        <h1 className="text-display text-6xl md:text-9xl mb-4">Get the Look</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Comparte tu look en redes mencionando <span className="text-primary">@ronin.oficial</span> y{" "}
          <span className="text-primary">#SoyRonin</span>.
        </p>
      </section>

      {/* Looks list — each row: fullscreen-ish campaign + product cards */}
      <div className="space-y-24 md:space-y-32 pb-24">
        {looks.map((look, idx) => (
          <LookRow key={look.id} look={look} reverse={idx % 2 === 1} />
        ))}
      </div>
    </SiteShell>
  );
}

interface LookProps {
  look: { id: number; image: string; handle: string; items: ShopifyProduct[] };
  reverse: boolean;
}

function LookRow({ look, reverse }: LookProps) {
  return (
    <section className="w-full">
      <div className={cn("grid md:grid-cols-2 gap-0 items-stretch", reverse && "md:[direction:rtl]")}>
        {/* Campaign image — huge, near fullscreen */}
        <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[90vh] bg-card overflow-hidden md:[direction:ltr]">
          <img
            src={look.image}
            alt={`Look ${look.handle}`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-xs uppercase tracking-widest bg-black/40 backdrop-blur px-3 py-1.5">
            {look.handle}
          </div>
        </div>

        {/* Products */}
        <div className="bg-background md:[direction:ltr] flex items-center">
          <div className="w-full p-6 md:p-12 lg:p-16">
            <p className="text-primary text-[10px] uppercase tracking-[0.35em] mb-3">
              Get the look · {look.items.length} artículos
            </p>
            <h2 className="text-display text-4xl md:text-6xl mb-8">Compone el look</h2>

            {look.items.length === 0 ? (
              <p className="text-muted-foreground">Aún no hay productos para armar este look.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {look.items.map((p) => (
                  <LookProductCard key={p.node.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function LookProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const img = p.images.edges[0]?.node;
  const variant = p.variants.edges[0]?.node;
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!variant) return;
    setAdding(true);
    await addItem({
      product: { id: p.id, title: p.title, handle: p.handle, images: p.images },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    setAdding(false);
  };

  return (
    <div className="bg-card border border-border/40 overflow-hidden flex flex-col">
      <Link to="/products/$handle" params={{ handle: p.handle }} className="block relative aspect-square bg-background">
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider line-clamp-2">{p.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !variant?.availableForSale}
          className="w-full bg-foreground text-background py-3 text-xs font-bold uppercase tracking-[0.25em] hover:bg-foreground/85 disabled:opacity-60 transition flex items-center justify-center gap-2"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir"}
        </button>
      </div>
    </div>
  );
}
