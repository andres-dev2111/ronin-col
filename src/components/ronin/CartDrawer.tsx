import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode || "COP";

  useEffect(() => {
    if (open) syncCart();
  }, [open, syncCart]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:max-w-md bg-background border-l border-border flex flex-col transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-display text-2xl tracking-wider">TU CARRITO</h3>
            <p className="text-xs text-muted-foreground">
              {totalItems === 0 ? "Vacío" : `${totalItems} artículo${totalItems !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Aún no has agregado nada</p>
            <button
              onClick={onClose}
              className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-wider font-medium"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item) => {
                const img = item.product.images?.edges?.[0]?.node;
                return (
                  <div key={item.variantId} className="flex gap-4 pb-4 border-b border-border">
                    <div className="w-20 h-24 bg-card flex-shrink-0 overflow-hidden">
                      {img && (
                        <img
                          src={img.url}
                          alt={img.altText ?? item.product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.selectedOptions.map((o) => o.value).join(" · ")}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.price.amount, item.price.currencyCode)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 hover:bg-secondary"
                            aria-label="Disminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1.5 hover:bg-secondary"
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground hover:text-primary"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-border space-y-4">
              <div className="flex justify-between">
                <span className="uppercase tracking-wider text-sm">Total</span>
                <span className="text-display text-2xl">{formatPrice(total, currency)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading || isSyncing}
                className="w-full bg-primary text-primary-foreground py-4 font-semibold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition"
              >
                {isLoading || isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Pagar en Shopify <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">
                Pago seguro · Envíos a toda Colombia
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
