import { createClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────────────────────────
// Server-side Supabase client (uses service_role key — bypasses RLS).
// Only import this from server functions / API routes, never from client code.
// ────────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "These are required for server functions.",
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ────────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────────

export interface CheckoutItem {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  unitPrice: number;
  currencyCode: string;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: "CC" | "CE" | "NIT" | "PAS";
  documentNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  department: string;
  postalCode?: string;
  notes?: string;
}

export interface CreateOrderInput {
  items: CheckoutItem[];
  customer: CustomerData;
  shippingCost: number;
  currencyCode?: string;
}

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      orderNumber: number;
      total: number;
    }
  | {
      success: false;
      error: string;
      outOfStockVariants?: string[];
    };

// ────────────────────────────────────────────────────────────────────────────────
// Validate stock for all items
// ────────────────────────────────────────────────────────────────────────────────

async function validateStock(
  items: CheckoutItem[],
): Promise<{ valid: boolean; outOfStock: string[] }> {
  const variantIds = items.map((i) => i.variantId);

  const { data: inventory } = await supabaseAdmin
    .from("inventory_available")
    .select("variant_id, available")
    .in("variant_id", variantIds);

  const availableMap = new Map(
    (inventory ?? []).map((row) => [row.variant_id, row.available]),
  );

  const outOfStock: string[] = [];
  for (const item of items) {
    const available = availableMap.get(item.variantId) ?? 0;
    if (available < item.quantity) {
      outOfStock.push(item.variantId);
    }
  }

  return { valid: outOfStock.length === 0, outOfStock };
}

// ────────────────────────────────────────────────────────────────────────────────
// Reserve stock (optimistic — will be confirmed on payment webhook)
// ────────────────────────────────────────────────────────────────────────────────

async function reserveStock(items: CheckoutItem[]) {
  for (const item of items) {
    await supabaseAdmin.rpc("increment_reserved", {
      p_variant_id: item.variantId,
      p_amount: item.quantity,
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Create order (pending payment)
// ────────────────────────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  try {
    const { items, customer, shippingCost, currencyCode = "COP" } = input;

    // 1. Validate stock
    const { valid, outOfStock } = await validateStock(items);
    if (!valid) {
      return {
        success: false,
        error: "Algunos productos están agotados.",
        outOfStockVariants: outOfStock,
      };
    }

    // 2. Reserve stock
    await reserveStock(items);

    // 3. Create customer
    const { data: customerRow, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        document_type: customer.documentType,
        document_number: customer.documentNumber,
        address_line1: customer.addressLine1,
        address_line2: customer.addressLine2,
        city: customer.city,
        department: customer.department,
        postal_code: customer.postalCode,
        notes: customer.notes,
      })
      .select("id")
      .single();

    if (customerError || !customerRow) {
      throw new Error(`Customer insert failed: ${customerError?.message}`);
    }

    // 4. Compute totals
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const total = subtotal + shippingCost;

    // 5. Create order
    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerRow.id,
        status: "pending",
        payment_status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        total,
        currency_code: currencyCode,
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderRow) {
      throw new Error(`Order insert failed: ${orderError?.message}`);
    }

    // 6. Create order items
    const orderItems = items.map((item) => ({
      order_id: orderRow.id,
      variant_id: item.variantId,
      product_title: item.productTitle,
      variant_title: item.variantTitle,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
    if (itemsError) {
      throw new Error(`Order items insert failed: ${itemsError.message}`);
    }

    return {
      success: true,
      orderId: orderRow.id,
      orderNumber: orderRow.order_number,
      total,
    };
  } catch (err) {
    console.error("[checkout] createOrder error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido al crear el pedido.",
    };
  }
}
