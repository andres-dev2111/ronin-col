import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImg from "@/assets/ronin-hero.jpg";
import promoImg from "@/assets/ronin-promo.jpg";
import type { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={heroImg}
        alt=""
        className="block w-full h-auto max-h-[92vh] object-cover"
        width={1920}
        height={1200}
      />
    </section>
  );
}

// Generic clothing test images (Unsplash)
const CATEGORIES = [
  {
    title: "Todos",
    handle: "all",
    img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=70",
  },
  {
    title: "Hoodies",
    handle: "hoodies",
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&auto=format&fit=crop&q=70",
  },
  {
    title: "Oversize",
    handle: "camisetas-oversize",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=70",
  },
  {
    title: "Básicas",
    handle: "new-arrivals",
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=70",
  },
];

export function CategoryGrid() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="mb-6 px-2 md:px-3">
        <p className="text-primary text-[10px] uppercase tracking-[0.35em] mb-1">Categorías</p>
        <h2 className="text-display text-2xl md:text-4xl tracking-wide">Elige tu armadura</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-1.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.handle}
            to="/collections/$handle"
            params={{ handle: c.handle }}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-card">
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] font-medium group-hover:text-primary transition">
              {c.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface CarouselProps {
  title: string;
  products: ShopifyProduct[];
  viewAllHandle?: string;
}

function ProductCarousel({ title, products, viewAllHandle }: CarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="w-full py-12 md:py-16">
      <div className="flex items-end justify-between mb-6 px-2 md:px-3">
        <h2 className="text-display text-2xl md:text-4xl leading-none tracking-wide">{title}</h2>
        <div className="flex items-center gap-3">
          {viewAllHandle && (
            <Link
              to="/collections/$handle"
              params={{ handle: viewAllHandle }}
              className="text-[10px] uppercase tracking-[0.25em] font-medium underline underline-offset-4 hover:text-primary"
            >
              Ver todo
            </Link>
          )}
          <div className="hidden md:flex gap-1">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
              className="h-9 w-9 border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Siguiente"
              className="h-9 w-9 border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="px-4"><EmptyProducts /></div>
      ) : (
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-1 md:gap-1.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <div
              key={p.node.id}
              className="snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[32%] lg:w-[24%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface FeaturedProps {
  products: ShopifyProduct[];
}

/** "Lo nuevo" — horizontal carousel */
export function FeaturedProducts({ products }: FeaturedProps) {
  return <ProductCarousel title="Lo nuevo" products={products} viewAllHandle="all" />;
}

/** "Oversize" — horizontal carousel */
export function OversizeCarousel({ products }: FeaturedProps) {
  return <ProductCarousel title="Oversize" products={products} viewAllHandle="camisetas-oversize" />;
}

export function EmptyProducts() {
  return (
    <div className="border border-dashed border-border p-12 text-center">
      <p className="text-display text-3xl mb-3">Sin productos aún</p>
      <p className="text-muted-foreground max-w-md mx-auto">
        Cuéntale al chat qué producto quieres crear y su precio, y aparecerá aquí
        automáticamente conectado a tu tienda Shopify.
      </p>
    </div>
  );
}

export function PromoBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={promoImg}
        alt=""
        className="block w-full h-auto max-h-[80vh] object-cover"
        loading="lazy"
      />
    </section>
  );
}

/** Medium promotional banner — image only */
export function MediumPromoBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1920&auto=format&fit=crop&q=70"
        alt=""
        className="block w-full h-[40vh] md:h-[55vh] object-cover"
        loading="lazy"
      />
    </section>
  );
}

const LOOKS = [
  { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=70" },
  { img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=70" },
  { img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=70" },
];

export function LookbookTeaser() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {LOOKS.map((l, i) => (
          <Link
            key={i}
            to="/lookbook"
            className="relative aspect-[4/5] overflow-hidden bg-card group"
          >
            <img
              src={l.img}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
