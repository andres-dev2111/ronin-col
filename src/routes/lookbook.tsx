import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { fetchProducts, formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Comunidad — Get the Look — RONIN" },
      { name: "description", content: "Outfits, looks y actitud de la comunidad Ronin. Toca cualquier look para ver las prendas y comprarlas." },
      { property: "og:title", content: "Comunidad — Get the Look — RONIN" },
      { property: "og:description", content: "Compone tu look con la comunidad Ronin." },
    ],
  }),
  component: Community,
});

/** Editorial vertical campaign photos */
const CAMPAIGNS = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1519058454-8f9d1e0a4a4a?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=75",
];

const HANDLES = [
  "@clarisse_vsr",
  "@mariaagi02",
  "@martinapaolini",
  "@mariacarballom",
  "@lu.ronin",
  "@sofi.k",
  "@dani.mv",
  "@val.rn",
];

interface Look {
  id: number;
  image: string;
  handle: string;
  items: ShopifyProduct[];
}

function Community() {
  const { data: products = [] } = useQuery({
    queryKey: ["products", "community"],
    queryFn: () => fetchProducts(24),
  });

  const looks: Look[] = CAMPAIGNS.map((img, i) => ({
    id: i,
    image: img,
    handle: HANDLES[i % HANDLES.length],
    // rotate through products so each look shows different items
    items: products.length
      ? Array.from({ length: 3 }, (_, k) => products[(i * 2 + k) % products.length])
      : [],
  }));

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeLook = activeIndex !== null ? looks[activeIndex] : null;

  const openLook = (i: number) => setActiveIndex(i);
  const closeLook = () => setActiveIndex(null);
  const nextLook = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % looks.length));
  const prevLook = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + looks.length) % looks.length,
    );

  return (
    <SiteShell>
      {/* Intro */}
      <section className="mx-auto max-w-[1600px] px-4 md:px-8 pt-12 md:pt-16 pb-8 text-center">
        <p className="text-primary text-xs uppercase tracking-[0.35em] mb-3">La comunidad</p>
        <h1 className="text-display text-5xl md:text-8xl mb-4">Get the Look</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Toca cualquier look para ver y comprar las prendas. Comparte el tuyo mencionando{" "}
          <span className="text-primary">@ronin.oficial</span> y{" "}
          <span className="text-primary">#SoyRonin</span>.
        </p>
      </section>

      {/* Immersive photo grid — no text over photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-1.5 pb-24 px-1 md:px-1.5">
        {looks.map((look, i) => (
          <button
            key={look.id}
            onClick={() => openLook(i)}
            aria-label={`Ver look ${look.handle}`}
            className="group relative aspect-[3/4] overflow-hidden bg-card"
          >
            <img
              src={look.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </button>
        ))}
      </div>

      {activeLook && (
        <LookModal
          look={activeLook}
          onClose={closeLook}
          onNext={nextLook}
          onPrev={prevLook}
        />
      )}
    </SiteShell>
  );
}

interface ModalProps {
  look: Look;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function LookModal({ look, onClose, onNext, onPrev }: ModalProps) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm overflow-y-auto">
      {/* Controls */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="fixed top-4 right-4 z-10 h-11 w-11 flex items-center justify-center bg-foreground text-background hover:bg-primary transition"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={onPrev}
        aria-label="Look anterior"
        className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center bg-foreground/80 text-background hover:bg-primary transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={onNext}
        aria-label="Siguiente look"
        className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center bg-foreground/80 text-background hover:bg-primary transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 min-h-screen")}>
        {/* Photo side */}
        <div className="relative bg-card md:sticky md:top-0 md:h-screen">
          <img
            src={look.image}
            alt={`Look ${look.handle}`}
            className="w-full h-full object-cover aspect-[3/4] md:aspect-auto"
          />
          <div className="absolute bottom-4 left-4 text-white text-[10px] uppercase tracking-[0.3em] bg-black/50 backdrop-blur px-3 py-1.5">
            {look.handle}
          </div>
        </div>

        {/* Products side */}
        <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <p className="text-primary text-[10px] uppercase tracking-[0.35em]">
              Get the look
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {look.items.length} artículo{look.items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <h2 className="text-display text-3xl md:text-5xl mb-8">Compone el look</h2>

          {look.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no hay productos para este look.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {look.items.map((p) => (
                <LookProductCard key={p.node.id} product={p} />
              ))}
            </div>
          )}

          {/* Mobile prev/next */}
          <div className="flex md:hidden justify-between mt-8 gap-3">
            <button
              onClick={onPrev}
              className="flex-1 border border-border py-3 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-card"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button
              onClick={onNext}
              className="flex-1 border border-border py-3 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-card"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
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
      <Link
        to="/products/$handle"
        params={{ handle: p.handle }}
        className="block relative aspect-square bg-background"
      >
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </Link>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex-1">
          <h3 className="text-[11px] uppercase tracking-wider line-clamp-2">{p.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !variant?.availableForSale}
          className="w-full bg-foreground text-background py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-foreground/85 disabled:opacity-60 transition flex items-center justify-center gap-2"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir"}
        </button>
      </div>
    </div>
  );
}
