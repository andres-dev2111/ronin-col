import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Package,
  LogOut,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  listOrders,
  updateOrderStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
  type OrderListItem,
} from "@/lib/admin";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin — RONIN" }],
  }),
  component: AdminPage,
});

const PAGE_SIZE = 20;

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  // ── Auth guard ─────────────────────────────────────────────────────────────
  const { data: session, isLoading: authLoading } = useQuery({
    queryKey: ["admin-session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/admin/login" });
    }
  }, [session, authLoading, navigate]);

  // ── Orders ─────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => listOrders(page, PAGE_SIZE),
    enabled: !!session,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Estado actualizado");
    },
    onError: () => toast.error("Error al actualizar el estado"),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const orders: OrderListItem[] = data?.orders ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  // Client-side search filter
  const filtered = search
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        return (
          String(o.order_number).includes(q) ||
          o.customers?.email?.toLowerCase().includes(q) ||
          o.customers?.first_name?.toLowerCase().includes(q) ||
          o.customers?.last_name?.toLowerCase().includes(q)
        );
      })
    : orders;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <span className="font-bold uppercase tracking-widest text-sm">RONIN Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-md hover:bg-card transition text-muted-foreground hover:text-foreground"
            aria-label="Refrescar"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(
            [
              ["Total pedidos", data?.total ?? 0, ""],
              ["Pendientes", orders.filter((o) => o.status === "pending").length, "text-amber-500"],
              ["Pagados", orders.filter((o) => o.status === "paid").length, "text-blue-500"],
              ["Enviados", orders.filter((o) => o.status === "shipped").length, "text-indigo-500"],
            ] as const
          ).map(([label, value, color]) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className={cn("text-3xl font-bold", color || "text-foreground")}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o #pedido…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-md focus:outline-none focus:border-primary"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                {["#", "Fecha", "Cliente", "Total", "Pago", "Estado", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    No hay pedidos
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-card/50 transition"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                      #{order.order_number}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {order.customers?.first_name} {order.customers?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.customers?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {formatPrice(order.total, order.currency_code)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          mutation.mutate({
                            id: order.id,
                            status: e.target.value as OrderStatus,
                          })
                        }
                        className={cn(
                          "text-xs border rounded-full px-2.5 py-1 font-medium cursor-pointer focus:outline-none",
                          ORDER_STATUS_COLORS[order.status],
                        )}
                      >
                        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                          <option key={s} value={s} className="bg-background text-foreground">
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/pedido/$id"
                        params={{ id: order.id }}
                        className="p-1.5 rounded-md hover:bg-primary hover:text-primary-foreground transition inline-flex"
                        aria-label="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-md border border-border hover:bg-card disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-md border border-border hover:bg-card disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
