import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

interface Props {
  product: ShopifyProduct;
}

function isNew(createdAt?: string) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days < 30;
}

export function ProductCard({ product }: Props) {
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const image2 = p.images.edges[1]?.node ?? image;
  const price = p.priceRange.minVariantPrice;
  const compareAt = p.compareAtPriceRange?.minVariantPrice;
  const onSale = compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const variant = p.variants.edges[0]?.node;
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Link
      to="/products/$handle"
      params={{ handle: p.handle }}
      className="group block"
    >
      <div className="relative aspect-[3/4] bg-card overflow-hidden mb-3">
        {image && (
          <>
            <img
              src={image.url}
              alt={image.altText ?? p.title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
              loading="lazy"
            />
            <img
              src={image2.url}
              alt={image2.altText ?? p.title}
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 scale-105"
              loading="lazy"
            />
          </>
        )}

        {/* badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew(p.createdAt) && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1">
              Nuevo
            </span>
          )}
          {onSale && (
            <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2 py-1">
              Oferta
            </span>
          )}
        </div>

        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          disabled={adding || !variant?.availableForSale}
          className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-3 font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-70"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" /> Añadir rápido
            </>
          )}
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition">
          {p.title}
        </h3>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold">{formatPrice(price.amount, price.currencyCode)}</p>
          {onSale && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(compareAt!.amount, compareAt!.currencyCode)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
