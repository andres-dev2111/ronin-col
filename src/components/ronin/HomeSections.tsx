import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/ronin-hero.jpg";
import promoImg from "@/assets/ronin-promo.jpg";
import type { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";

export function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Ronin en la ciudad"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1200}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />

      <div className="relative z-10 h-full mx-auto max-w-[1600px] px-4 md:px-8 flex flex-col justify-end pb-16 md:pb-24">
        <p className="text-primary text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.35em] mb-4 fade-in">
          Colección · Otoño / Invierno
        </p>
        <h1 className="text-display text-6xl sm:text-8xl md:text-[10rem] lg:text-[13rem] leading-[0.82] mb-8 fade-in">
          Viste como
          <br />
          <span className="text-primary">Ronin.</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 fade-in">
          <Link
            to="/collections/all"
            className="bg-primary text-primary-foreground px-10 py-5 font-semibold uppercase tracking-[0.2em] text-sm text-center hover:bg-primary/90 transition"
          >
            Comprar ahora
          </Link>
          <Link
            to="/lookbook"
            className="border border-foreground/40 text-foreground px-10 py-5 font-semibold uppercase tracking-[0.2em] text-sm text-center hover:border-primary hover:text-primary transition"
          >
            Ver comunidad
          </Link>
        </div>
      </div>
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
        <p className="text-primary text-xs uppercase tracking-[0.35em] mb-2">Categorías</p>
        <h2 className="text-display text-5xl md:text-7xl">Elige tu armadura</h2>
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
            <p className="mt-4 text-center text-sm md:text-base uppercase tracking-[0.3em] font-semibold group-hover:text-primary transition">
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

/** "Lo nuevo" — huge product cards, full-bleed layout */
export function FeaturedProducts({ products }: FeaturedProps) {
  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <h2 className="text-display text-6xl md:text-8xl leading-none">Lo nuevo</h2>
        <Link
          to="/collections/all"
          className="hidden md:inline-flex text-sm uppercase tracking-[0.25em] font-semibold underline underline-offset-4 hover:text-primary"
        >
          Ver todo
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyProducts />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
    <section className="relative w-full overflow-hidden bg-card border-y border-border">
      <div className="grid md:grid-cols-2 min-h-[70vh]">
        <div className="relative min-h-[400px]">
          <img
            src={promoImg}
            alt="Drop exclusivo"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card md:to-card/0" />
        </div>
        <div className="p-8 md:p-20 flex flex-col justify-center items-center text-center">
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-3">Drop exclusivo</p>
          <h2 className="text-display text-6xl md:text-8xl mb-6 leading-none">
            Hoodies &<br />
            <span className="text-primary">Oversize.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Cortes amplios, calidad premium, estampados que no se rinden. La armadura del samurái
            moderno.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/collections/sets-ronin"
              className="bg-primary text-primary-foreground px-8 py-4 uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition"
            >
              Ver drops
            </Link>
            <Link
              to="/collections/all"
              className="border border-border px-8 py-4 uppercase text-sm tracking-wider font-semibold hover:border-primary hover:text-primary transition"
            >
              Ver todo
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4 overflow-hidden">
        <div className="ticker-track text-display text-3xl md:text-4xl text-primary/80">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              RONIN <span className="text-foreground">·</span> DROP 01 <span className="text-foreground">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const LOOKS = [
  { name: "Look Street", tag: "Urbano diario", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=70" },
  { name: "Look Dark", tag: "Nocturno", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=70" },
  { name: "Look Raw", tag: "Minimal crudo", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=70" },
];

export function LookbookTeaser() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">La comunidad</p>
          <h2 className="text-display text-5xl md:text-7xl">Comunidad Ronin</h2>
        </div>
        <Link
          to="/lookbook"
          className="text-sm uppercase tracking-wider font-semibold underline underline-offset-4 hover:text-primary"
        >
          Ver galería →
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-3 md:gap-4">
        {LOOKS.map((l) => (
          <Link
            key={l.name}
            to="/lookbook"
            className="group relative aspect-[4/5] overflow-hidden bg-card"
          >
            <img
              src={l.img}
              alt={l.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <span className="text-xs uppercase tracking-widest text-white/80">
                {l.tag}
              </span>
              <div>
                <h3 className="text-display text-5xl md:text-6xl text-white group-hover:text-primary transition">
                  {l.name}
                </h3>
                <p className="text-xs uppercase tracking-wider mt-2 text-primary opacity-0 group-hover:opacity-100 transition">
                  Get the look →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
