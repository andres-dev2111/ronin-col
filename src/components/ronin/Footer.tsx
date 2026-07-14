import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "./Logo";

const TICKER_ITEMS = [
  "SIN LÍMITES",
  "STREETWEAR PREMIUM",
  "RONIN",
  "ÚNETE A LA COMUNIDAD",
  "CALIDAD PREMIUM",
  "SIN LÍMITES",
  "STREETWEAR PREMIUM",
  "RONIN",
  "ÚNETE A LA COMUNIDAD",
  "CALIDAD PREMIUM",
];

export function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-card border-t border-border mt-24">
      {/* Ticker */}
      <div className="border-y border-border py-6 overflow-hidden bg-background">
        <div className="ticker-track text-display text-4xl md:text-6xl">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              {t}
              <span className="text-primary">·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        {/* Newsletter */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h3 className="text-display text-4xl md:text-5xl mb-3">
            Únete a la <span className="text-primary">comunidad Ronin</span>
          </h3>
          <p className="text-muted-foreground mb-6">
            Drops exclusivos, acceso anticipado y ofertas solo para Ronines.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              toast.success("Bienvenido a la comunidad Ronin");
              setEmail("");
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="flex-1 bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 font-medium uppercase tracking-wider text-sm hover:bg-primary/90 transition"
            >
              Suscribirme
            </button>
          </form>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="text-2xl mb-4"><Logo /></div>
            <p className="text-sm text-muted-foreground">
              Streetwear premium para hombres urbanos que no necesitan permiso.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/collections/all" className="hover:text-primary">Todo</Link></li>
              <li><Link to="/collections/hoodies" className="hover:text-primary">Hoodies</Link></li>
              <li><Link to="/collections/camisetas-oversize" className="hover:text-primary">Oversize</Link></li>
              <li><Link to="/collections/sets-ronin" className="hover:text-primary">Drops</Link></li>
              <li><Link to="/lookbook" className="hover:text-primary">Comunidad</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Ayuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Envíos</a></li>
              <li><a href="#" className="hover:text-primary">Devoluciones</a></li>
              <li><a href="#" className="hover:text-primary">Guía de tallas</a></li>
              <li><a href="#" className="hover:text-primary">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Términos</a></li>
              <li><a href="#" className="hover:text-primary">Privacidad</a></li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="TikTok" className="text-muted-foreground hover:text-primary text-lg font-bold">
                TT
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RONIN. Sin límites.</p>
          <p>Hecho con actitud en Colombia.</p>
        </div>
      </div>
    </footer>
  );
}
