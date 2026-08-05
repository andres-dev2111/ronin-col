import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  CreditCard,
  Loader2,
  ClipboardCopy,
} from "lucide-react";
import {
  getOrderDetail,
  updateOrderStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
  type OrderDetail,
} from "@/lib/admin";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pedido/$id")({
  head: () => ({
    meta: [{ title: "Detalle de pedido — RONIN Admin" }],
  }),
  component: AdminOrderDetailPage,
});

function AdminOrderDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<OrderDetail | null>({
    queryKey: ["admin-order", id],
    queryFn: () => getOrderDetail(id),
  });

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Estado actualizado");
    },
    onError: () => toast.error("Error al actualizar"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Pedido no encontrado.</p>
        <Link to="/admin/" className="text-primary underline">
          Volver
        </Link>
      </div>
    );
  }

  const customer = order.customers;
  const items = order.order_items;
  const currency = order.currency_code;

  const copyRef = () => {
    if (order.payment_reference) {
      navigator.clipboard.writeText(order.payment_reference);
      toast.success("Referencia copiada");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center gap-4">
        <Link
          to="/admin/"
          className="p-2 rounded-md hover:bg-card transition text-muted-foreground"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedido</p>
          <h1 className="font-bold text-lg">#{order.order_number}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => mutation.mutate(e.target.value as OrderStatus)}
            disabled={mutation.isPending}
            className={cn(
              "text-sm border rounded-full px-3 py-1.5 font-medium cursor-pointer focus:outline-none",
              ORDER_STATUS_COLORS[order.status],
            )}
          >
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* ── Customer ─────────────────────────────────────────────────── */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-semibold uppercase tracking-wider text-xs">Cliente</h2>
          </div>
          {customer ? (
            <div className="space-y-1.5 text-sm">
              <p className="font-medium">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-muted-foreground">{customer.email}</p>
              <p className="text-muted-foreground">{customer.phone}</p>
              <p className="text-muted-foreground text-xs pt-1">
                {customer.document_type}: {customer.document_number}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Sin datos de cliente</p>
          )}
        </section>

        {/* ── Address ──────────────────────────────────────────────────── */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="font-semibold uppercase tracking-wider text-xs">Dirección de envío</h2>
          </div>
          {customer ? (
            <div className="space-y-1 text-sm">
              <p>{customer.address_line1}</p>
              {customer.address_line2 && (
                <p className="text-muted-foreground">{customer.address_line2}</p>
              )}
              <p className="text-muted-foreground">
                {customer.city}, {customer.department}
                {customer.postal_code ? ` — CP ${customer.postal_code}` : ""}
              </p>
              {customer.notes && (
                <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  📝 {customer.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Sin dirección</p>
          )}
        </section>

        {/* ── Payment ──────────────────────────────────────────────────── */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="font-semibold uppercase tracking-wider text-xs">Pago</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium">
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </span>
            </div>
            {order.payment_method && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método</span>
                <span>{order.payment_method}</span>
              </div>
            )}
            {order.payment_reference && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Referencia</span>
                <button
                  onClick={copyRef}
                  className="flex items-center gap-1 font-mono text-xs hover:text-primary transition"
                >
                  {order.payment_reference.slice(0, 20)}…
                  <ClipboardCopy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Items ────────────────────────────────────────────────────── */}
        <section className="border border-border rounded-lg p-5 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="font-semibold uppercase tracking-wider text-xs">
              Artículos ({items.length})
            </h2>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-border last:border-0 text-sm"
              >
                <div>
                  <p className="font-medium">{item.product_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant_title} · ×{item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.total_price, currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.unit_price, currency)} c/u
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>
                {order.shipping_cost === 0
                  ? "Gratis"
                  : formatPrice(order.shipping_cost, currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total, currency)}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
