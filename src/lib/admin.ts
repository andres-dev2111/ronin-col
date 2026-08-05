// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { supabase } from "./supabase";

// Untyped alias used only in .update() calls where the generic resolves to never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;


// ────────────────────────────────────────────────────────────────────────────────
// Explicit types for query results (Supabase's type inference doesn't always
// resolve nested selects correctly at compile time).
// ────────────────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "in_process";

export interface OrderListItem {
  id: string;
  order_number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  currency_code: string;
  created_at: string;
  customers: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface OrderDetail {
  id: string;
  order_number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_method: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency_code: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customers: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    document_type: string;
    document_number: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    department: string;
    postal_code: string | null;
    notes: string | null;
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

// ────────────────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────────────────

export async function listOrders(
  page = 0,
  pageSize = 20,
): Promise<{ orders: OrderListItem[]; total: number }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: rawData, error, count } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      payment_status,
      total,
      currency_code,
      created_at,
      customers ( first_name, last_name, email, phone )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (rawData as any[]) ?? [];
  const orders = rows.map((row: any) => ({
    ...row,
    customers: Array.isArray(row.customers) ? (row.customers[0] ?? null) : row.customers,
  })) as OrderListItem[];

  return { orders, total: count ?? 0 };
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const { data: rawData, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      payment_status,
      payment_reference,
      payment_method,
      subtotal,
      shipping_cost,
      total,
      currency_code,
      metadata,
      created_at,
      updated_at,
      customers (
        first_name, last_name, email, phone,
        document_type, document_number,
        address_line1, address_line2,
        city, department, postal_code, notes
      ),
      order_items (
        id, product_title, variant_title, quantity, unit_price, total_price
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) throw error;
  if (!rawData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = rawData as any;
  // Normalise: Supabase may return the 1:1 join as array
  const customers = Array.isArray(data.customers)
    ? (data.customers[0] ?? null)
    : data.customers;
  const order_items = (data.order_items ?? []) as OrderDetail["order_items"];

  return { ...data, customers, order_items } as OrderDetail;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await db
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

// ────────────────────────────────────────────────────────────────────────────────
// Label maps
// ────────────────────────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Reembolsado",
  in_process: "En proceso",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  paid: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  shipped: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  delivered: "text-green-500 bg-green-500/10 border-green-500/20",
  cancelled: "text-red-500 bg-red-500/10 border-red-500/20",
  refunded: "text-gray-500 bg-gray-500/10 border-gray-500/20",
};
