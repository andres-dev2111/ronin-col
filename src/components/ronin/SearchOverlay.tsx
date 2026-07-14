import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Search, Loader2 } from "lucide-react";
import { formatPrice, storefrontApiRequest } from "@/lib/shopify";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText: string | null };
  price?: { amount: string; currencyCode: string };
}

const PREDICTIVE_QUERY = `
  query Predict($query: String!) {
    predictiveSearch(query: $query, limit: 6, types: PRODUCT) {
      products {
        id
        title
        handle
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(PREDICTIVE_QUERY, { query: q });
        const products = data?.data?.predictiveSearch?.products ?? [];
        setResults(
          products.map((p: {
            id: string;
            title: string;
            handle: string;
            featuredImage: { url: string; altText: string | null } | null;
            priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
          }) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            image: p.featuredImage ?? undefined,
            price: p.priceRange.minVariantPrice,
          })),
        );
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md fade-in">
      <div className="mx-auto max-w-3xl px-4 md:px-6 pt-6 md:pt-12">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca hoodies, oversize, drops..."
            className="flex-1 bg-transparent text-lg md:text-2xl text-display tracking-wider outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          <button onClick={onClose} aria-label="Cerrar búsqueda" className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          {q.trim().length < 2 && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Sugerencias
              </p>
              <div className="flex flex-wrap gap-2">
                {["hoodies", "oversize", "drops", "básicas", "negro"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="px-4 py-2 border border-border rounded-full text-xs uppercase tracking-wider hover:border-primary hover:text-primary transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-border/60 mt-2">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/products/$handle"
                    params={{ handle: r.handle }}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 hover:bg-card px-2 -mx-2 rounded transition"
                  >
                    <div className="w-14 h-16 bg-card overflow-hidden shrink-0">
                      {r.image && (
                        <img
                          src={r.image.url}
                          alt={r.image.altText ?? r.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      {r.price && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(r.price.amount, r.price.currencyCode)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs uppercase tracking-wider text-primary">Ver →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {q.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="text-sm text-muted-foreground mt-6">
              Sin resultados para "{q}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
