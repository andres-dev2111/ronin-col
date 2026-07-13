import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Truck, ShieldCheck, RotateCcw, Package } from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { fetchProductByHandle, formatPrice, type ShopifyVariant } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle.replace(/-/g, " ")} — RONIN` },
      { name: "description", content: `Producto RONIN — Streetwear premium.` },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const [selectedOpts, setSelectedOpts] = useState<Record<string, string>>({});
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variants = product?.variants.edges.map((e) => e.node) ?? [];
  const activeVariant: ShopifyVariant | undefined = useMemo(() => {
    if (variants.length === 0) return undefined;
    const keys = Object.keys(selectedOpts);
    if (keys.length === 0) return variants[0];
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => selectedOpts[o.name] === o.value),
      ) ?? variants[0]
    );
  }, [variants, selectedOpts]);

  const handleAdd = async () => {
    if (!product || !activeVariant) return;
    setAdding(true);
    await addItem({
      product: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        images: product.images,
      },
      variantId: activeVariant.id,
      variantTitle: activeVariant.title,
      price: activeVariant.price,
      quantity: 1,
      selectedOptions: activeVariant.selectedOptions,
    });
    setAdding(false);
  };

  if (isLoading) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-display text-4xl">Producto no encontrado</h1>
          <Link
            to="/collections/all"
            className="bg-primary text-primary-foreground px-6 py-3 uppercase tracking-wider text-sm"
          >
            Ver catálogo
          </Link>
        </div>
      </SiteShell>
    );
  }

  const images = product.images.edges;
  const currentImg = images[imgIdx]?.node ?? images[0]?.node;
  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const inStock = activeVariant?.availableForSale ?? false;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-card overflow-hidden mb-3">
              {currentImg && (
                <img
                  src={currentImg.url}
                  alt={currentImg.altText ?? product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      "aspect-square bg-card overflow-hidden border",
                      i === imgIdx ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">RONIN</p>
            <h1 className="text-display text-4xl md:text-5xl mb-4">{product.title}</h1>
            <p className="text-2xl mb-6">{formatPrice(price.amount, price.currencyCode)}</p>

            {product.description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>
            )}

            {/* Options */}
            {product.options
              .filter((o) => o.values.length > 1 || o.name !== "Title")
              .map((option) => (
                <div key={option.name} className="mb-6">
                  <p className="text-xs uppercase tracking-wider mb-3">
                    {option.name}
                    {selectedOpts[option.name] && (
                      <span className="text-muted-foreground ml-2 normal-case">
                        · {selectedOpts[option.name]}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const active = selectedOpts[option.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() =>
                            setSelectedOpts((s) => ({ ...s, [option.name]: val }))
                          }
                          className={cn(
                            "min-w-12 px-4 py-2 text-sm border transition uppercase tracking-wider",
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary",
                          )}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Stock */}
            <p
              className={cn(
                "text-xs uppercase tracking-wider mb-4",
                inStock ? "text-primary" : "text-muted-foreground",
              )}
            >
              {inStock ? "● En stock — envío en 24h" : "● Agotado"}
            </p>

            <button
              onClick={handleAdd}
              disabled={!inStock || adding}
              className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-wider font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir al carrito"}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-border">
              <TrustBadge icon={<Truck className="h-4 w-4" />} label="Envío gratis > $150k" />
              <TrustBadge icon={<ShieldCheck className="h-4 w-4" />} label="Pago 100% seguro" />
              <TrustBadge icon={<RotateCcw className="h-4 w-4" />} label="Cambios 30 días" />
              <TrustBadge icon={<Package className="h-4 w-4" />} label="Algodón 320GSM" />
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
}
