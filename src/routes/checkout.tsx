import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingBag,
  User,
  CreditCard,
  ChevronRight,
  Check,
  Loader2,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, fetchShippingConfig } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createOrder } from "@/lib/checkout";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — RONIN" },
      { name: "description", content: "Completa tu pedido RONIN." },
    ],
  }),
  component: CheckoutPage,
});

// ─── Zod schema ───────────────────────────────────────────────────────────────

const customerSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  documentType: z.enum(["CC", "CE", "NIT", "PAS"]),
  documentNumber: z.string().min(5, "Documento inválido"),
  addressLine1: z.string().min(5, "Dirección muy corta"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Ciudad inválida"),
  department: z.string().min(2, "Departamento inválido"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

// ─── Steps config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "Resumen", icon: ShoppingBag },
  { id: 1, label: "Datos", icon: User },
  { id: 2, label: "Pago", icon: CreditCard },
];

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada", "Bogotá D.C.",
];

// ─── Main component ───────────────────────────────────────────────────────────

function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const { items, clearCart, subtotal } = useCartStore();
  const sub = subtotal();

  const { data: shipping } = useQuery({
    queryKey: ["shipping-config"],
    queryFn: fetchShippingConfig,
    staleTime: 5 * 60 * 1000,
  });

  const shippingCost =
    shipping?.free_shipping_above && sub >= shipping.free_shipping_above
      ? 0
      : (shipping?.fixed_cost ?? 10000);

  const total = sub + shippingCost;
  const currency = items[0]?.price.currencyCode ?? "COP";

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { documentType: "CC" },
  });

  // Redirect empty cart
  if (items.length === 0 && step !== 2) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
          <button
            onClick={() => navigate({ to: "/collections/all" })}
            className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-wider text-sm font-semibold"
          >
            Ver productos
          </button>
        </div>
      </SiteShell>
    );
  }

  const handleCustomerSubmit = (data: CustomerForm) => {
    void data; // data stored in form state, used on final submit
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    const customer = form.getValues();
    setSubmitting(true);
    try {
      const result = await createOrder({
        items: items.map((i) => ({
          variantId: i.variantId,
          productTitle: i.product.title,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          unitPrice: parseFloat(i.price.amount),
          currencyCode: i.price.currencyCode,
        })),
        customer,
        shippingCost,
        currencyCode: currency,
      });

      if (!result.success) {
        toast.error(result.error ?? "Error al crear el pedido");
        return;
      }

      setPendingOrderId(result.orderId);
      clearCart();
      navigate({ to: "/pedido/$id", params: { id: result.orderId } });
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-14">
        {/* Stepper */}
        <nav aria-label="Pasos del checkout" className="mb-10">
          <ol className="flex items-center justify-center gap-0">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <li key={s.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => step > s.id && setStep(s.id)}
                    disabled={step <= s.id}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-4 group",
                      step <= s.id && "cursor-default",
                    )}
                    aria-current={active ? "step" : undefined}
                  >
                    <span
                      className={cn(
                        "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all",
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : active
                          ? "bg-background border-primary text-primary"
                          : "bg-background border-border text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider hidden sm:block",
                        active ? "text-primary font-semibold" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-px w-12 md:w-24 transition-colors",
                        step > idx ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* ── STEP 0: Cart summary ─────────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">Tu pedido</h1>
              <div className="space-y-4">
                {items.map((item) => {
                  const img = item.product.images?.edges?.[0]?.node;
                  return (
                    <div key={item.variantId} className="flex gap-4 pb-4 border-b border-border">
                      <div className="w-20 h-24 bg-card flex-shrink-0 overflow-hidden">
                        {img && (
                          <img src={img.url} alt={img.altText ?? ""} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {item.selectedOptions.map((o) => o.value).join(" · ")}
                        </p>
                        <p className="text-sm">
                          {item.quantity} × {formatPrice(item.price.amount, item.price.currencyCode)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(parseFloat(item.price.amount) * item.quantity, item.price.currencyCode)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-8 w-full bg-primary text-primary-foreground py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition"
              >
                Continuar <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── STEP 1: Customer data ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={form.handleSubmit(handleCustomerSubmit)} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-muted-foreground hover:text-foreground transition"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold uppercase tracking-wide">Tus datos</h1>
              </div>

              {/* Name row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre" error={form.formState.errors.firstName?.message}>
                  <input
                    {...form.register("firstName")}
                    id="checkout-firstName"
                    placeholder="Juan"
                    className="checkout-input"
                  />
                </Field>
                <Field label="Apellido" error={form.formState.errors.lastName?.message}>
                  <input
                    {...form.register("lastName")}
                    id="checkout-lastName"
                    placeholder="Pérez"
                    className="checkout-input"
                  />
                </Field>
              </div>

              {/* Contact */}
              <Field label="Email" error={form.formState.errors.email?.message}>
                <input
                  {...form.register("email")}
                  id="checkout-email"
                  type="email"
                  placeholder="juan@email.com"
                  className="checkout-input"
                />
              </Field>
              <Field label="Teléfono / WhatsApp" error={form.formState.errors.phone?.message}>
                <input
                  {...form.register("phone")}
                  id="checkout-phone"
                  type="tel"
                  placeholder="3001234567"
                  className="checkout-input"
                />
              </Field>

              {/* Document */}
              <div className="grid sm:grid-cols-[160px_1fr] gap-4">
                <Field label="Tipo de documento" error={form.formState.errors.documentType?.message}>
                  <select {...form.register("documentType")} id="checkout-docType" className="checkout-input">
                    <option value="CC">Cédula (CC)</option>
                    <option value="CE">Cédula Extranjería (CE)</option>
                    <option value="NIT">NIT</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </Field>
                <Field label="Número de documento" error={form.formState.errors.documentNumber?.message}>
                  <input
                    {...form.register("documentNumber")}
                    id="checkout-docNumber"
                    placeholder="1000000000"
                    className="checkout-input"
                  />
                </Field>
              </div>

              {/* Address */}
              <Field label="Dirección" error={form.formState.errors.addressLine1?.message}>
                <input
                  {...form.register("addressLine1")}
                  id="checkout-address"
                  placeholder="Calle 123 # 45-67, Apto 101"
                  className="checkout-input"
                />
              </Field>
              <Field label="Apto / Barrio (opcional)" error={form.formState.errors.addressLine2?.message}>
                <input
                  {...form.register("addressLine2")}
                  id="checkout-address2"
                  placeholder="Barrio El Poblado"
                  className="checkout-input"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Ciudad" error={form.formState.errors.city?.message}>
                  <input
                    {...form.register("city")}
                    id="checkout-city"
                    placeholder="Medellín"
                    className="checkout-input"
                  />
                </Field>
                <Field label="Departamento" error={form.formState.errors.department?.message}>
                  <select {...form.register("department")} id="checkout-dept" className="checkout-input">
                    <option value="">Seleccionar…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Notas para el pedido (opcional)">
                <textarea
                  {...form.register("notes")}
                  id="checkout-notes"
                  rows={2}
                  placeholder="Instrucciones de entrega, referencias, etc."
                  className="checkout-input resize-none"
                />
              </Field>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition"
              >
                Continuar al pago <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ── STEP 2: Payment ───────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-muted-foreground hover:text-foreground transition"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold uppercase tracking-wide">Pago</h1>
              </div>

              {/* Payment placeholder — Mercado Pago Brick will mount here */}
              <div
                id="mp-payment-brick"
                className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center gap-4 mb-6 min-h-[200px]"
              >
                <CreditCard className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm max-w-xs">
                  El módulo de Mercado Pago se integrará aquí una vez que configures tus credenciales
                  (<code className="text-xs bg-card px-1.5 py-0.5 rounded">VITE_MP_PUBLIC_KEY</code> y{" "}
                  <code className="text-xs bg-card px-1.5 py-0.5 rounded">MP_ACCESS_TOKEN</code>).
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Soportará: Tarjeta de crédito · PSE · Nequi
                </p>
              </div>

              {/* Temporary: confirm order without payment (dev mode) */}
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4 mb-6">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                  ⚠️ Modo de desarrollo
                </p>
                <p className="text-xs text-muted-foreground">
                  Por ahora puedes crear el pedido sin pago real. Al integrar Mercado Pago, este botón
                  se reemplazará por el formulario de pago seguro.
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                id="btn-confirm-order"
                className="w-full bg-foreground text-background py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-foreground/85 disabled:opacity-50 transition"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar pedido"
                )}
              </button>
            </div>
          )}

          {/* ── ORDER SUMMARY SIDEBAR ────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="font-semibold uppercase tracking-wider text-sm">Resumen del pedido</h2>

              {/* Mini items */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-xs gap-2">
                    <span className="text-muted-foreground truncate flex-1">
                      {item.product.title}{" "}
                      <span className="text-foreground/60">
                        · {item.selectedOptions.map((o) => o.value).join(" ")}
                      </span>
                      {" "}×{item.quantity}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {formatPrice(parseFloat(item.price.amount) * item.quantity, item.price.currencyCode)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(sub, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" /> Envío
                  </span>
                  <span>{shippingCost === 0 ? "Gratis 🎉" : formatPrice(shippingCost, currency)}</span>
                </div>
                {shipping?.free_shipping_above && shippingCost > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Gratis en compras &gt; {formatPrice(shipping.free_shipping_above, currency)}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total, currency)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Inline styles for checkout inputs */}
      <style>{`
        .checkout-input {
          width: 100%;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 0.375rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-foreground);
          transition: border-color 0.15s;
          outline: none;
        }
        .checkout-input:focus {
          border-color: var(--color-primary);
        }
        .checkout-input::placeholder {
          color: var(--color-muted-foreground);
        }
      `}</style>
    </SiteShell>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-foreground/70">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
