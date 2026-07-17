import { Link } from "@tanstack/react-router";
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
    <section className="mx-auto max-w-[1600px] px-4 md:px-8 py-20">
      <div className="mb-10">
        <p className="text-primary text-[10px] uppercase tracking-[0.35em] mb-2">Categorías</p>
        <h2 className="text-display text-2xl md:text-3xl tracking-wide">Elige tu armadura</h2>

      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
            </div>
            <p className="mt-3 text-center text-[11px] md:text-xs uppercase tracking-[0.3em] font-medium group-hover:text-primary transition">
              {c.title}
            </p>

          </Link>
        ))}
      </div>
    </section>
  );
}

interface FeaturedProps {
  products: ShopifyProduct[];
}

/** "Lo nuevo" — full-bleed maxed product grid (Dynamo style) */
export function FeaturedProducts({ products }: FeaturedProps) {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="flex items-end justify-between mb-6 px-2 md:px-3">
        <h2 className="text-display text-2xl md:text-4xl leading-none tracking-wide">Lo nuevo</h2>
        <Link
          to="/collections/all"
          className="text-[10px] uppercase tracking-[0.25em] font-medium underline underline-offset-4 hover:text-primary"
        >
          Ver todo
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="px-4"><EmptyProducts /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-1.5">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
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
      <Link to="/collections/all" aria-label="Ver colección" className="block">
        <img
          src={promoImg}
          alt=""
          className="block w-full h-auto max-h-[80vh] object-cover"
          loading="lazy"
        />
      </Link>
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

