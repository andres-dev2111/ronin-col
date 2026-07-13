import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/ronin-hero.jpg";
import promoImg from "@/assets/ronin-promo.jpg";
import type { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";

export function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Ronin en la ciudad"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1200}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />

      <div className="relative z-10 h-full mx-auto max-w-7xl px-4 md:px-6 flex flex-col justify-end pb-16 md:pb-24">
        <p className="text-primary text-sm md:text-base uppercase tracking-[0.3em] mb-4 fade-in">
          Colección — Otoño / Invierno
        </p>
        <h1 className="text-display text-6xl md:text-9xl leading-[0.85] mb-6 fade-in">
          Viste como
          <br />
          <span className="text-primary">Ronin.</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-xl mb-8 fade-in">
          Sin amo. Sin límites. Streetwear premium para hombres urbanos que no necesitan permiso.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-12 fade-in">
          <Link
            to="/collections/all"
            className="bg-primary text-primary-foreground px-8 py-4 font-semibold uppercase tracking-wider text-sm text-center hover:bg-primary/90 transition"
          >
            Comprar ahora
          </Link>
          <Link
            to="/lookbook"
            className="border border-foreground/40 text-foreground px-8 py-4 font-semibold uppercase tracking-wider text-sm text-center hover:border-primary hover:text-primary transition"
          >
            Ver lookbook
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl fade-in">
          {[
            { n: "+5K", l: "Ronines" },
            { n: "320g", l: "Algodón Premium" },
            { n: "100%", l: "Sin amo" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-display text-3xl md:text-4xl text-primary">{s.n}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CATEGORIES = [
  { title: "Esencial", subtitle: "Básicos elevados", handle: "camisetas-oversize", accent: "from-neutral-800 to-neutral-950" },
  { title: "Premium", subtitle: "Hoodies 320GSM", handle: "hoodies", accent: "from-red-950 to-black" },
  { title: "Nuevo", subtitle: "Recién llegado", handle: "new-arrivals", accent: "from-zinc-800 to-black" },
  { title: "Limited", subtitle: "Sets exclusivos", handle: "sets-ronin", accent: "from-neutral-900 to-red-950" },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
      <div className="mb-10 text-center">
        <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">Colecciones</p>
        <h2 className="text-display text-5xl md:text-7xl">Elige tu armadura</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.handle}
            to="/collections/$handle"
            params={{ handle: c.handle }}
            className={`group relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${c.accent} border border-border`}
          >
            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_60%)]" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {c.subtitle}
              </p>
              <h3 className="text-display text-4xl md:text-5xl group-hover:text-primary transition-colors">
                {c.title}
              </h3>
              <span className="mt-3 text-xs uppercase tracking-wider text-foreground/60 group-hover:text-primary transition">
                Explorar →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface FeaturedProps {
  products: ShopifyProduct[];
}

export function FeaturedProducts({ products }: FeaturedProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">Más vendidos</p>
          <h2 className="text-display text-4xl md:text-6xl">Los favoritos</h2>
        </div>
        <Link
          to="/collections/all"
          className="hidden md:inline-flex text-sm uppercase tracking-wider text-muted-foreground hover:text-primary"
        >
          Ver todo →
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyProducts />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((p) => (
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
    <section className="relative overflow-hidden bg-card border-y border-border">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[400px]">
          <img
            src={promoImg}
            alt="Drop exclusivo"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card md:to-card/0" />
        </div>
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-3">Drop exclusivo</p>
          <h2 className="text-display text-5xl md:text-7xl mb-4 leading-none">
            Hoodies &<br />
            <span className="text-primary">Oversize.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Cortes amplios, algodón 320GSM, estampados que no se rinden. La armadura del samurái
            moderno.
          </p>
          <div className="flex gap-3">
            <Link
              to="/collections/hoodies"
              className="bg-primary text-primary-foreground px-6 py-3 uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition"
            >
              Ver hoodies
            </Link>
            <Link
              to="/collections/camisetas-oversize"
              className="border border-border px-6 py-3 uppercase text-sm tracking-wider font-semibold hover:border-primary hover:text-primary transition"
            >
              Ver oversize
            </Link>
          </div>
        </div>
      </div>

      {/* Ticker */}
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
  { name: "Look Street", tag: "Urbano diario", accent: "from-zinc-800" },
  { name: "Look Dark", tag: "Nocturno", accent: "from-red-950" },
  { name: "Look Raw", tag: "Minimal crudo", accent: "from-neutral-900" },
];

export function LookbookTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">La comunidad</p>
          <h2 className="text-display text-4xl md:text-6xl">Lookbook</h2>
        </div>
        <Link
          to="/lookbook"
          className="text-sm uppercase tracking-wider text-muted-foreground hover:text-primary"
        >
          Ver galería →
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {LOOKS.map((l) => (
          <Link
            key={l.name}
            to="/lookbook"
            className={`group relative aspect-[4/5] bg-gradient-to-b ${l.accent} to-background overflow-hidden border border-border`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(200,16,46,0.15),transparent_60%)]" />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {l.tag}
              </span>
              <div>
                <h3 className="text-display text-5xl md:text-6xl group-hover:text-primary transition">
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
