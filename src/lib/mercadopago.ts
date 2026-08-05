/**
 * RONIN — Integración Mercado Pago
 *
 * Este módulo se activa cuando se configuran las credenciales:
 *   MP_ACCESS_TOKEN   (servidor — NUNCA exponer al cliente)
 *   VITE_MP_PUBLIC_KEY (cliente — seguro exponer)
 *
 * Flujo:
 *   1. checkout.tsx llama a createPreference({ orderId, items, customer })
 *   2. Esta función crea una preferencia en MP y devuelve el preference_id
 *   3. El frontend inicializa el Payment Brick con ese preference_id
 *   4. MP redirige al success/failure URL después del pago
 *   5. El webhook /api/mp-webhook actualiza el estado del pedido
 *
 * Documentación:
 *   https://www.mercadopago.com.co/developers/es/docs/checkout-pro/integration-configuration/create-preference
 *   https://www.mercadopago.com.co/developers/es/docs/checkout-bricks/payment-brick/introduction
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MPPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MPPayer {
  name: string;
  surname: string;
  email: string;
  identification: {
    type: string; // CC, CE, NIT, PAS
    number: string;
  };
}

export interface CreatePreferenceInput {
  orderId: string;
  orderNumber: number;
  items: MPPreferenceItem[];
  payer: MPPayer;
  totalAmount: number;
  shippingCost: number;
}

export interface MPPreferenceResult {
  preferenceId: string;
  initPoint: string;       // URL de Checkout Pro (redirige a MP)
  sandboxInitPoint: string; // URL de pruebas
}

// ─── Create preference ────────────────────────────────────────────────────────

/**
 * Crea una preferencia de pago en Mercado Pago.
 * Solo ejecutar en el servidor (server function de TanStack Start).
 */
export async function createMPPreference(
  input: CreatePreferenceInput,
): Promise<MPPreferenceResult | null> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const appUrl = process.env.VITE_APP_URL ?? "https://ronin.co";

  if (!accessToken) {
    console.error("[mercadopago] MP_ACCESS_TOKEN no configurado");
    return null;
  }

  const body = {
    external_reference: input.orderId,
    items: input.items,
    payer: input.payer,
    shipments: {
      cost: input.shippingCost,
      mode: "not_specified",
    },
    back_urls: {
      success: `${appUrl}/pedido/${input.orderId}?payment=success`,
      failure: `${appUrl}/checkout?payment=failure&order=${input.orderId}`,
      pending: `${appUrl}/pedido/${input.orderId}?payment=pending`,
    },
    auto_return: "approved",
    notification_url: `${appUrl}/api/mp-webhook`,
    metadata: {
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
    statement_descriptor: "RONIN",
    // Habilitar PSE y tarjetas para Colombia
    payment_methods: {
      excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
      installments: 12,
    },
  };

  try {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[mercadopago] Error creando preferencia:", err);
      return null;
    }

    const data = await res.json();
    return {
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    };
  } catch (err) {
    console.error("[mercadopago] Fetch error:", err);
    return null;
  }
}

// ─── Verify webhook signature ─────────────────────────────────────────────────

/**
 * Verifica la firma HMAC del webhook de Mercado Pago.
 * Header: x-signature → ts=...,v1=...
 */
export function verifyMPWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string,
): boolean {
  try {
    // MP signature format: "ts=<timestamp>,v1=<hash>"
    const parts = Object.fromEntries(
      xSignature.split(",").map((p) => p.split("=")),
    );
    const ts = parts["ts"];
    const v1 = parts["v1"];
    if (!ts || !v1) return false;

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Node.js crypto for HMAC-SHA256
    // (import dynamically to avoid bundling issues on client)
    // This function should only be called from server routes.
    const crypto = require("crypto") as typeof import("crypto");
    const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
    return expected === v1;
  } catch {
    return false;
  }
}

// ─── Get payment status from MP ───────────────────────────────────────────────

export async function getMPPaymentStatus(paymentId: string): Promise<{
  status: string;
  statusDetail: string;
  externalReference: string;
} | null> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      status: data.status,
      statusDetail: data.status_detail,
      externalReference: data.external_reference,
    };
  } catch {
    return null;
  }
}
