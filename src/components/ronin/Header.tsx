import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

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
    { to: "/collections/hoodies", label: "Hoodies" },
    { to: "/collections/camisetas-oversize", label: "Camisetas" },
    { to: "/collections/sets-ronin", label: "Sets" },
    { to: "/lookbook", label: "Lookbook" },
  ];

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b border-border/50",
          scrolled
            ? "bg-background/85 backdrop-blur-md"
            : "bg-background/95",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/" aria-label="RONIN — Inicio" className="text-3xl md:text-4xl leading-none">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeProps={{ className: "text-primary" }}
                  className="text-sm font-medium tracking-wider uppercase text-foreground/80 hover:text-primary transition"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 md:gap-5">
              <button aria-label="Buscar" className="text-foreground/80 hover:text-primary transition">
                <Search className="h-5 w-5" />
              </button>
              <button aria-label="Cuenta" className="text-foreground/80 hover:text-primary transition hidden sm:block">
                <User className="h-5 w-5" />
              </button>
              <button
                aria-label="Carrito"
                onClick={onOpenCart}
                className="relative text-foreground/80 hover:text-primary transition"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
        <div className="fixed inset-0 z-50 bg-background md:hidden fade-in">
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <Link to="/" onClick={() => setMobileOpen(false)} aria-label="RONIN — Inicio" className="text-3xl leading-none">
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
          </nav>
        </div>
      )}
    </>
  );
}
