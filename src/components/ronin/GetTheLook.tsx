import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchProducts, formatPrice, type CatalogProductEdge } from "@/lib/catalog";
import { useCartStore } from "@/stores/cartStore";
import { WishlistButton } from "./WishlistButton";

interface Props {
  heroImage: string;
  heroAlt?: string;
  handle?: string; // credit / caption
}

export function GetTheLook({ heroImage, heroAlt = "Look Ronin", handle = "@RONIN" }: Props) {
  const { data: products = [] } = useQuery({
    queryKey: ["getthelook"],
    queryFn: () => fetchProducts(2),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
      <div className="mb-8 text-center">
        <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">Combínalo</p>
        <h2 className="text-display text-4xl md:text-6xl">Get the look</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <div className="relative aspect-[4/5] bg-card overflow-hidden">
          <img
            src={heroImage}
            alt={heroAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <span className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-widest">
            {handle}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold">Get the look</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {products.length} artículo{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground text-sm">
                Aún no hay productos para armar el look.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 2).map((p) => (
                <LookCard key={p.node.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LookCard({ product }: { product: CatalogProductEdge }) {
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const variant = p.variants.edges[0]?.node;
  const price = variant?.price ?? p.priceRange.minVariantPrice;
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  const onAdd = () => {
    if (!variant) return;
    setAdding(true);
    addItem({
      product: { id: p.id, title: p.title, handle: p.handle, images: p.images },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
    setAdding(false);
  };

  return (
    <div className="bg-card">
      <Link
        to="/products/$handle"
        params={{ handle: p.handle }}
        className="relative aspect-square bg-background block overflow-hidden"
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? p.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <WishlistButton productId={p.id} productTitle={p.title} className="absolute top-2 right-2" size="sm" />
      </Link>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wider truncate">{p.title}</p>
        <p className="text-sm font-semibold mb-3">{formatPrice(price.amount, price.currencyCode)}</p>
        <button
          onClick={onAdd}
          disabled={adding || !variant?.availableForSale}
          className="w-full bg-foreground text-background py-2.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground/85 disabled:opacity-50 transition flex items-center justify-center"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir"}
        </button>
      </div>
    </div>
  );
}
