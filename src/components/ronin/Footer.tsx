import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";


const TICKER_ITEMS = [
  "SIN LÍMITES",
  "STREETWEAR PREMIUM",
  "RONIN",
  "ÚNETE A LA COMUNIDAD",
  "CALIDAD PREMIUM",
];

// TikTok icon (lucide has no TikTok, inline SVG)
function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.6 6.3a5.3 5.3 0 0 1-3.3-1.2 5.3 5.3 0 0 1-1.9-3.3h-3.3v13.4a2.8 2.8 0 1 1-2.8-2.8c.3 0 .6 0 .9.1V9.1a6.1 6.1 0 1 0 5.2 6V9.4a8.6 8.6 0 0 0 5.2 1.7V7.8c0-.5 0-1-.1-1.5Z" />
    </svg>
  );
}

export function Footer() {
  return (

    <footer className="bg-card border-t border-border mt-24">
      {/* Ticker */}
      <div className="border-y border-border py-6 overflow-hidden bg-background">
        <div className="ticker-track text-display text-4xl md:text-6xl">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              {t}
              <span className="text-primary">·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-16">
        {/* Centered brand logo */}
        <div className="flex justify-center pb-12 md:pb-16">
          <div className="h-16 md:h-20">
            <Logo />
          </div>
        </div>




        {/* Columns: Brand · Contact · Follow · Help */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="text-4xl mb-4"><Logo /></div>
            <p className="text-sm text-muted-foreground">
              Streetwear premium para hombres urbanos. Sin límites.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] mb-5">Contacto</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href="https://wa.me/573053405157" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  WhatsApp: +57 3053405157
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Atención al cliente:<br />3053405157</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href="mailto:servicioalcliente@ronin.co" className="hover:text-primary break-all">
                  servicioalcliente@ronin.co
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Bucaramanga, Santander</span>
              </li>
            </ul>
          </div>

          {/* Síguenos */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] mb-5">Síguenos</h4>
            <div className="flex gap-3">
              {[
                { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
                { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
                { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
                { href: "https://tiktok.com", label: "TikTok", Icon: TikTok },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-11 w-11 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              @ronin.oficial — Comparte tu look con <span className="text-primary">#SoyRonin</span>
            </p>
          </div>

          {/* Ayuda / Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] mb-5">Ayuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/collections/all" className="hover:text-primary">Tienda</Link></li>
              <li><Link to="/lookbook" className="hover:text-primary">Comunidad</Link></li>
              <li><a href="#" className="hover:text-primary">Envíos</a></li>
              <li><a href="#" className="hover:text-primary">Devoluciones</a></li>
              <li><a href="#" className="hover:text-primary">Guía de tallas</a></li>
              <li><a href="#" className="hover:text-primary">Términos y privacidad</a></li>
            </ul>
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
