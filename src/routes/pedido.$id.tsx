import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Package, Truck, MapPin, CreditCard } from "lucide-react";
import { SiteShell } from "@/components/ronin/SiteShell";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Pedido confirmado — RONIN" },
      { name: "description", content: "Tu pedido RONIN ha sido recibido." },
    ],
  }),
  component: OrderConfirmationPage,
});

// ─── Explicit result type ──────────────────────────────────────────────────────

interface OrderResult {
  id: string;
  order_number: number;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency_code: string;
  created_at: string;
  customers: {
    first_name: string;
    last_name: string;
    email: string;
    address_line1: string;
    city: string;
    department: string;
  } | null;
  order_items: Array<{
    id: string;
    product_title: string;
    variant_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

function OrderConfirmationPage() {
  const { id } = Route.useParams();

  const { data: order, isLoading } = useQuery<OrderResult | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          status,
          payment_status,
          subtotal,
          shipping_cost,
          total,
          currency_code,
          created_at,
          customers (
            first_name,
            last_name,
            email,
            address_line1,
            city,
            department
          ),
          order_items (
            id,
            product_title,
            variant_title,
            quantity,
            unit_price,
            total_price
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      // Normalise join (Supabase sometimes returns array for FK relations)
      const raw = data as Record<string, unknown>;
      return {
        ...(raw as Omit<OrderResult, "customers" | "order_items">),
        customers: Array.isArray(raw.customers)
          ? ((raw.customers[0] as OrderResult["customers"]) ?? null)
          : (raw.customers as OrderResult["customers"]),
        order_items: Array.isArray(raw.order_items)
          ? (raw.order_items as OrderResult["order_items"])
          : [],
      } as OrderResult;
    },
  });

  if (isLoading) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SiteShell>
    );
  }

  if (!order) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-3xl font-bold">Pedido no encontrado</h1>
          <Link to="/" className="text-primary underline">
            Volver al inicio
          </Link>
        </div>
      </SiteShell>
    );
  }

  const customer = order.customers;
  const items = order.order_items;
  const currency = order.currency_code;

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-2">
            ¡Pedido confirmado!
          </h1>
          <p className="text-muted-foreground">
            Pedido #{order.order_number} · Gracias {customer?.first_name} 🖤
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Recibirás un mensaje de confirmación a <strong>{customer?.email}</strong>
          </p>
        </div>

        {/* Status bar */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            {
              icon: CreditCard,
              label: "Pago",
              value: statusLabel(order.payment_status),
              active: order.payment_status === "approved",
            },
            {
              icon: Package,
              label: "Preparación",
              value:
                order.status === "paid" || order.status === "shipped" || order.status === "delivered"
                  ? "En proceso"
                  : "Pendiente",
              active: order.status !== "pending",
            },
            {
              icon: Truck,
              label: "Envío",
              value:
                order.status === "shipped" || order.status === "delivered"
                  ? "Enviado"
                  : "Pendiente",
              active: order.status === "shipped" || order.status === "delivered",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`rounded-lg border p-4 text-center transition-colors ${
                  s.active ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mx-auto mb-1.5 ${
                    s.active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  {s.label}
                </p>
                <p className={`text-xs font-semibold ${s.active ? "text-primary" : "text-foreground"}`}>
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Items */}
        <section className="mb-8">
          <h2 className="text-sm uppercase tracking-wider font-semibold mb-4">Artículos</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-border text-sm"
              >
                <div>
                  <p className="font-medium">{item.product_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant_title} · ×{item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.total_price, currency)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="bg-card border border-border rounded-lg p-5 space-y-2 text-sm mb-8">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>{order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost, currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.total, currency)}</span>
          </div>
        </section>

        {/* Delivery info */}
        {customer && (
          <section className="border border-border rounded-lg p-5 mb-10">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm uppercase tracking-wider font-semibold">
                Dirección de entrega
              </h2>
            </div>
            <p className="text-sm">
              {customer.first_name} {customer.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{customer.address_line1}</p>
            <p className="text-sm text-muted-foreground">
              {customer.city}, {customer.department}
            </p>
          </section>
        )}

        {/* CTA */}
        <div className="text-center space-y-3">
          <Link
            to="/collections/all"
            className="block w-full bg-primary text-primary-foreground py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition"
          >
            Seguir comprando
          </Link>
          <p className="text-xs text-muted-foreground">
            ¿Dudas? Escríbenos por{" "}
            <a
              href="https://wa.me/573000000000"
              target="_blank"
              rel="noopener"
              className="underline hover:text-primary"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobado ✓",
    rejected: "Rechazado",
    refunded: "Reembolsado",
    in_process: "En proceso",
  };
  return map[status] ?? status;
}
