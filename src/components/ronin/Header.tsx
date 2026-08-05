import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";

const ANNOUNCEMENTS = [
  "⚡ ENVÍO GRATIS en compras mayores a $150.000",
  "🔥 NUEVA TEMPORADA — SIN LÍMITES",
  "🥋 CALIDAD PREMIUM · CORTES OVERSIZE",
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-primary text-primary-foreground text-xs md:text-sm py-2 text-center font-medium tracking-wide overflow-hidden">
      <div key={i} className="fade-in">
        {ANNOUNCEMENTS[i]}
      </div>
    </div>
  );
}

interface HeaderProps {
  onOpenCart: () => void;
}


export function Header({ onOpenCart }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { to: "/collections/all", label: "Shop" },
    { to: "/collections/sets-ronin", label: "Drops" },
    { to: "/lookbook", label: "Comunidad" },
  ];

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b border-border/50",
          scrolled ? "bg-background/85 backdrop-blur-md" : "bg-background/95",
        )}
      >
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20 md:h-28 gap-4">
            {/* Left: nav (desktop) / menu (mobile) */}

            <div className="flex items-center justify-start">
              <button
                className="lg:hidden text-foreground"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6" />
              </button>
              <nav className="hidden lg:flex items-center gap-8">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    activeProps={{ className: "text-primary" }}
                    className="text-sm font-medium tracking-[0.2em] uppercase text-foreground/80 hover:text-primary transition"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: logo (much bigger) */}
            <Link
              to="/"
              aria-label="RONIN — Inicio"
              className="justify-self-center h-14 md:h-20 lg:h-24 flex items-center"
            >
              <Logo />
            </Link>


            {/* Right: icons */}
            <div className="flex items-center justify-end gap-4 md:gap-6">
              <button
                aria-label="Buscar"
                onClick={() => setSearchOpen(true)}
                className="text-foreground/80 hover:text-primary transition"
              >
                <Search className="h-6 w-6" />
              </button>
              <Link
                to="/admin/"
                aria-label="Panel admin"
                className="text-foreground/80 hover:text-primary transition hidden sm:block"
              >
                <User className="h-6 w-6" />
              </Link>
              <button
                aria-label="Carrito"
                onClick={onOpenCart}
                className="relative text-foreground/80 hover:text-primary transition"
              >
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden fade-in">
          <div className="flex items-center justify-between px-4 h-20 border-b border-border">
            <Link to="/" onClick={() => setMobileOpen(false)} aria-label="RONIN — Inicio" className="h-10 flex items-center">
              <Logo />
            </Link>

            <button onClick={() => setMobileOpen(false)} aria-label="Cerrar">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-6">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="text-display text-3xl tracking-wider hover:text-primary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/admin/"
              className="text-display text-3xl tracking-wider hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
