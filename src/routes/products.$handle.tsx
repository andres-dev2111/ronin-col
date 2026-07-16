import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Ruler,
  Truck,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import {
  createBuyNowCheckout,
  fetchProductByHandle,
  formatPrice,
  type ShopifyVariant,
} from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { Accordion } from "@/components/ronin/Accordion";
import { WishlistButton } from "@/components/ronin/WishlistButton";
import { toast } from "sonner";

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
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variants = product?.variants.edges.map((e) => e.node) ?? [];
  const images = product?.images.edges ?? [];

  const activeVariant: ShopifyVariant | undefined = useMemo(() => {
    if (variants.length === 0) return undefined;
    if (Object.keys(selectedOpts).length === 0) return variants[0];
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => selectedOpts[o.name] === o.value),
      ) ?? variants[0]
    );
  }, [variants, selectedOpts]);

  // Sync main image with active variant: try to match altText against any
  // selected option value; fall back to variant position in the list.
  useEffect(() => {
    if (!activeVariant || images.length === 0) return;
    const values = activeVariant.selectedOptions.map((o) => o.value.toLowerCase());
    const idx = images.findIndex((img) => {
      const alt = (img.node.altText ?? "").toLowerCase();
      return values.some((v) => v && alt.includes(v));
    });
    if (idx >= 0) {
      setImgIdx(idx);
      return;
    }
    const variantIdx = variants.findIndex((v) => v.id === activeVariant.id);
    if (variantIdx >= 0 && variantIdx < images.length) setImgIdx(variantIdx);
  }, [activeVariant, images, variants]);

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
      quantity: qty,
      selectedOptions: activeVariant.selectedOptions,
    });
    setAdding(false);
    toast.success("Añadido a la cesta");
  };

  const handleBuyNow = async () => {
    if (!activeVariant) return;
    setBuyingNow(true);
    try {
      const url = await createBuyNowCheckout(activeVariant.id, qty);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("No se pudo iniciar el checkout");
      }
    } finally {
      setBuyingNow(false);
    }
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

  const currentImg = images[imgIdx]?.node ?? images[0]?.node;
  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale = compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const inStock = activeVariant?.availableForSale ?? false;

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1600px] px-3 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 lg:gap-14">
          {/* GALLERY */}
          <div>
            {/* Main image — giant, zoom on hover */}
            <ZoomImage
              src={currentImg?.url}
              alt={currentImg?.altText ?? product.title}
              onFullscreen={() => setFullscreen(true)}
              productId={product.id}
              productTitle={product.title}
            />

            {/* Thumbnails BELOW the main image */}
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 md:grid-cols-6 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      "aspect-square bg-card overflow-hidden border-2 transition",
                      i === imgIdx ? "border-primary" : "border-transparent hover:border-border",
                    )}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-primary text-[10px] uppercase tracking-[0.3em] mb-2">RONIN</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">{product.title}</h1>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <p className={cn("text-2xl md:text-3xl font-semibold", onSale && "text-primary")}>
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
                  <p className="text-sm font-semibold mb-3 uppercase tracking-wider">
                    {option.name}
                    {selectedOpts[option.name] && (
                      <span className="text-muted-foreground ml-2 font-normal normal-case tracking-normal">
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
                          onClick={() => setSelectedOpts((s) => ({ ...s, [option.name]: val }))}
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

            {/* Quantity + Add to cart */}
            <div className="flex items-stretch gap-3 mb-3">
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 h-full hover:bg-card transition"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums select-none">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-4 h-full hover:bg-card transition"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!inStock || adding}
                className="flex-1 bg-foreground text-background py-4 uppercase tracking-[0.25em] font-bold text-sm hover:bg-foreground/85 disabled:opacity-50 transition flex items-center justify-center gap-2 rounded-full"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agregar al carrito"}
              </button>
            </div>

            {/* Buy it now */}
            <button
              onClick={handleBuyNow}
              disabled={!inStock || buyingNow}
              className="w-full border-2 border-foreground text-foreground py-4 uppercase tracking-[0.25em] font-bold text-sm hover:bg-foreground hover:text-background disabled:opacity-50 transition flex items-center justify-center gap-2 rounded-full mb-6"
            >
              {buyingNow ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pagar ahora"}
            </button>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Envío gratis +$150k</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Pago seguro</div>
              <div className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-primary" /> Cambios 30d</div>
            </div>

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

      {/* Fullscreen viewer */}
      {fullscreen && currentImg && (
        <FullscreenViewer
          images={images.map((i) => i.node)}
          index={imgIdx}
          onChange={setImgIdx}
          onClose={() => setFullscreen(false)}
          title={product.title}
        />
      )}
    </SiteShell>
  );
}

/* ---------------- Zoom image (giant, hover-zoom, mobile-touch pan) ---------------- */

interface ZoomImageProps {
  src?: string;
  alt: string;
  onFullscreen: () => void;
  productId: string;
  productTitle: string;
}

function ZoomImage({ src, alt, onFullscreen, productId, productTitle }: ZoomImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const move = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/5] md:aspect-square bg-card overflow-hidden group"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={(e) => zoom && move(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        setZoom(true);
        const t = e.touches[0];
        if (t) move(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) move(t.clientX, t.clientY);
      }}
      onTouchEnd={() => setZoom(false)}
    >
      {src && (
        <>
          <img
            src={src}
            alt={alt}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
              zoom ? "opacity-0" : "opacity-100",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-200 pointer-events-none",
              zoom ? "opacity-100" : "opacity-0",
            )}
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "220%",
              backgroundPosition: `${pos.x}% ${pos.y}%`,
            }}
          />
        </>
      )}

      {/* Fullscreen trigger */}
      <button
        onClick={onFullscreen}
        aria-label="Ver en pantalla completa"
        className="absolute top-4 left-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center hover:bg-background transition"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <WishlistButton
        productId={productId}
        productTitle={productTitle}
        className="absolute top-4 right-4"
      />

      {/* Hint */}
      <span className="hidden md:block absolute bottom-4 left-4 text-[10px] uppercase tracking-widest bg-background/70 backdrop-blur px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition">
        Mueve para hacer zoom
      </span>
    </div>
  );
}

/* ---------------- Fullscreen viewer ---------------- */

interface FullscreenViewerProps {
  images: Array<{ url: string; altText: string | null }>;
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
  title: string;
}

function FullscreenViewer({ images, index, onChange, onClose, title }: FullscreenViewerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onChange, onClose]);

  const img = images[index];
  return (
    <div className="fixed inset-0 z-[60] bg-background/98 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border/40">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {title} — {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="h-10 w-10 rounded-full hover:bg-card flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex-1 flex items-center justify-center p-4">
        {img && (
          <img src={img.url} alt={img.altText ?? title} className="max-h-full max-w-full object-contain" />
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onChange((index - 1 + images.length) % images.length)}
              aria-label="Anterior"
              className="absolute left-4 h-12 w-12 rounded-full bg-card/70 backdrop-blur border border-border flex items-center justify-center hover:bg-card"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => onChange((index + 1) % images.length)}
              aria-label="Siguiente"
              className="absolute right-4 h-12 w-12 rounded-full bg-card/70 backdrop-blur border border-border flex items-center justify-center hover:bg-card"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
