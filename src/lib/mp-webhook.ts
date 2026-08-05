/**
 * RONIN — Webhook de Mercado Pago
 *
 * Ruta: POST /api/mp-webhook
 * Configurar en el dashboard de MP:
 *   Notificaciones → Webhooks → URL: https://tudominio.com/api/mp-webhook
 *   Eventos: payment
 */

import { supabaseAdmin } from "@/lib/checkout";
import { getMPPaymentStatus, verifyMPWebhookSignature } from "@/lib/mercadopago";

// Map Mercado Pago payment status → internal payment_status
const MP_STATUS_MAP: Record<string, string> = {
  approved: "approved",
  pending: "pending",
  in_process: "in_process",
  rejected: "rejected",
  cancelled: "pending",
  refunded: "refunded",
  charged_back: "refunded",
};

export async function handleMPWebhook(request: Request): Promise<Response> {
  const secret = process.env.MP_WEBHOOK_SECRET;

  // 1. Verify signature
  if (secret) {
    const xSignature = request.headers.get("x-signature") ?? "";
    const xRequestId = request.headers.get("x-request-id") ?? "";
    const url = new URL(request.url);
    const dataId = url.searchParams.get("data.id") ?? "";

    if (!verifyMPWebhookSignature(xSignature, xRequestId, dataId, secret)) {
      console.warn("[mp-webhook] Firma inválida");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let body: { type?: string; data?: { id?: string } };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // 2. Only handle payment events
  if (body.type !== "payment" || !body.data?.id) {
    return new Response("OK", { status: 200 });
  }

  const paymentId = String(body.data.id);

  // 3. Fetch payment status from MP API
  const payment = await getMPPaymentStatus(paymentId);
  if (!payment) {
    console.error("[mp-webhook] No se pudo obtener el pago:", paymentId);
    return new Response("OK", { status: 200 }); // always 200 to avoid MP retries
  }

  const orderId = payment.externalReference;
  const paymentStatus = MP_STATUS_MAP[payment.status] ?? "pending";

  // 4. Update order in Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderUpdate: Record<string, any> = {
    payment_status: paymentStatus,
    payment_reference: paymentId,
    payment_method: "mercadopago",
  };

  if (paymentStatus === "approved") {
    orderUpdate.status = "paid";
    // Confirm stock: decrements quantity and releases reserved
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin.rpc as any)("confirm_stock", { p_order_id: orderId });
  }

  if (paymentStatus === "rejected" || paymentStatus === "refunded") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin.rpc as any)("release_reserved", { p_order_id: orderId });
    if (paymentStatus === "refunded") orderUpdate.status = "refunded";
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update(orderUpdate)
    .eq("id", orderId);

  if (error) {
    console.error("[mp-webhook] Error actualizando pedido:", (error as { message: string }).message);
  } else {
    console.log(`[mp-webhook] Pedido ${orderId} actualizado → ${paymentStatus}`);
  }

  return new Response("OK", { status: 200 });
}
