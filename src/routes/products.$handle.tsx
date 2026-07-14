import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Ruler, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { fetchProductByHandle, formatPrice, type ShopifyVariant } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { Accordion } from "@/components/ronin/Accordion";
import { WishlistButton } from "@/components/ronin/WishlistButton";

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
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale = compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const inStock = activeVariant?.availableForSale ?? false;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="grid md:grid-cols-[80px_1fr_1fr] gap-4 md:gap-8 lg:gap-12">
          {/* Desktop side thumbnails */}
          {images.length > 1 && (
            <div className="hidden md:flex flex-col gap-2">
              {images.map((img, i) => (
                <button
                  key={img.node.url}
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    "aspect-square bg-card overflow-hidden border rounded-sm",
                    i === imgIdx ? "border-primary" : "border-transparent hover:border-border",
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

          {/* Main image */}
          <div className={cn(images.length <= 1 && "md:col-span-2")}>
            <div className="relative aspect-square bg-card overflow-hidden rounded-sm">
              {currentImg && (
                <img
                  src={currentImg.url}
                  alt={currentImg.altText ?? product.title}
                  className="w-full h-full object-cover"
                />
              )}
              <WishlistButton
                productId={product.id}
                productTitle={product.title}
                className="absolute top-4 right-4"
              />
            </div>
            {/* Mobile thumbnail row */}
            {images.length > 1 && (
              <div className="md:hidden grid grid-cols-5 gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      "aspect-square bg-card overflow-hidden border rounded-sm",
                      i === imgIdx ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-primary text-[10px] uppercase tracking-[0.3em] mb-2">RONIN</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">{product.title}</h1>

            <div className="flex items-center gap-3 mb-6">
              <p className={cn("text-2xl font-semibold", onSale && "text-primary")}>
                {formatPrice(price.amount, price.currencyCode)}
              </p>
              {onSale && (
                <>
                  <p className="text-lg text-muted-foreground line-through">
                    {formatPrice(compareAt!.amount, compareAt!.currencyCode)}
                  </p>
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                    En oferta
                  </span>
                </>
              )}
            </div>

            {/* Options */}
            {product.options
              .filter((o) => o.values.length > 1 || o.name !== "Title")
              .map((option) => (
                <div key={option.name} className="mb-6">
                  <p className="text-sm font-semibold mb-3">
                    {option.name}
                    {selectedOpts[option.name] && (
                      <span className="text-muted-foreground ml-2 font-normal">
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
                            "min-w-14 px-4 py-2.5 text-sm border transition uppercase tracking-wider rounded-md",
                            active
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:border-foreground",
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
                "text-xs uppercase tracking-wider mb-4 inline-flex items-center gap-2",
                inStock ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-primary" : "bg-muted-foreground")} />
              {inStock ? "En stock — envío en 24h" : "Agotado"}
            </p>

            <button
              onClick={handleAdd}
              disabled={!inStock || adding}
              className="w-full bg-foreground text-background py-4 uppercase tracking-[0.25em] font-bold text-sm hover:bg-foreground/85 disabled:opacity-50 transition flex items-center justify-center gap-2 rounded-full"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir a la cesta"}
            </button>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3 mt-6 text-[10px] uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Envío gratis +$150k</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Pago seguro</div>
              <div className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-primary" /> Cambios 30d</div>
            </div>

            {/* Accordions */}
            <Accordion
              className="mt-8"
              items={[
                {
                  title: "Descripción",
                  defaultOpen: true,
                  content: (
                    <p>{product.description || "Prenda RONIN de estética urbana premium. Corte oversize, tejido de peso medio y estampado firmado."}</p>
                  ),
                },
                {
                  title: "Composición, cuidados y origen",
                  content: (
                    <ul className="space-y-1.5">
                      <li>· Composición: algodón peinado premium (detalle exacto en etiqueta).</li>
                      <li>· Cuidados: lavar del revés en agua fría, no usar blanqueador, secar a la sombra.</li>
                      <li>· Origen: diseñado en Colombia. Confeccionado con estándares premium.</li>
                    </ul>
                  ),
                },
                {
                  title: "Guía de tallas",
                  icon: <Ruler className="h-4 w-4" />,
                  content: (
                    <div className="space-y-2">
                      <p>Los cortes RONIN son oversize. Si buscas fit ajustado, elige una talla menos.</p>
                      <div className="grid grid-cols-4 gap-2 text-xs mt-3">
                        {[
                          ["Talla", "Pecho", "Largo", "Manga"],
                          ["S", "108", "70", "62"],
                          ["M", "114", "72", "63"],
                          ["L", "120", "74", "64"],
                          ["XL", "126", "76", "65"],
                        ].map((row, i) => (
                          <div key={i} className={cn("contents", i === 0 && "font-semibold text-foreground")}>
                            {row.map((c, j) => (
                              <span key={j} className="border border-border px-2 py-1 text-center">{c}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Envíos y devoluciones",
                  content: (
                    <p>
                      Envíos a toda Colombia en 24–72h. Envío gratis en compras superiores a
                      $150.000. Cambios y devoluciones dentro de los 30 días.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
