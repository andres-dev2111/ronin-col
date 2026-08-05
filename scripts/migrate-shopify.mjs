#!/usr/bin/env node
/**
 * RONIN — Script de migración: Shopify → Supabase
 *
 * Uso:
 *   node scripts/migrate-shopify.mjs
 *
 * Variables de entorno requeridas (en .env):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SHOPIFY_STORE_PERMANENT_DOMAIN   (ej: wcw37a-x8.myshopify.com)
 *   SHOPIFY_STOREFRONT_TOKEN
 *
 * El script es idempotente: usa upsert con la columna 'handle' como clave.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config(); // carga .env

// ─── Config ──────────────────────────────────────────────────────────────────

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_PERMANENT_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno. Revisa .env.example");
  process.exit(1);
}

const SHOPIFY_URL = `https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Shopify queries ──────────────────────────────────────────────────────────

const PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          description
          handle
          tags
          createdAt
          status
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 8) { edges { node { url altText } } }
          variants(first: 20) {
            edges {
              node {
                id
                title
                sku
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
                inventoryQuantity
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

async function shopifyRequest(query, variables = {}) {
  const res = await fetch(SHOPIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) {
    console.error("Shopify errors:", json.errors);
    throw new Error("Shopify GraphQL error");
  }
  return json.data;
}

// ─── Fetch all products (handles pagination) ─────────────────────────────────

async function fetchAllProducts() {
  const all = [];
  let cursor = null;
  let page = 1;

  while (true) {
    console.log(`  📦 Página ${page}…`);
    const data = await shopifyRequest(PRODUCTS_QUERY, { first: 50, after: cursor });
    const edges = data.products.edges;
    all.push(...edges.map((e) => e.node));

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
    page++;
  }

  return all;
}

// ─── Transform & upsert ──────────────────────────────────────────────────────

async function migrateProduct(product) {
  // 1. Upsert product
  const images = product.images.edges.map((e) => ({
    url: e.node.url,
    altText: e.node.altText ?? null,
  }));

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .upsert(
      {
        handle: product.handle,
        title: product.title,
        description: product.description ?? "",
        images,
        tags: product.tags ?? [],
        status: product.status?.toLowerCase() === "active" ? "active" : "draft",
      },
      { onConflict: "handle" },
    )
    .select("id")
    .single();

  if (productError || !productRow) {
    console.error(`  ❌ Product "${product.handle}":`, productError?.message);
    return 0;
  }

  const productId = productRow.id;
  const variants = product.variants.edges.map((e) => e.node);
  let migratedVariants = 0;

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];

    const { data: variantRow, error: variantError } = await supabase
      .from("product_variants")
      .upsert(
        {
          product_id: productId,
          sku: v.sku ?? null,
          title: v.title,
          price: parseFloat(v.price.amount),
          compare_at_price: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null,
          currency_code: v.price.currencyCode,
          selected_options: v.selectedOptions ?? [],
          position: i,
        },
        { onConflict: "product_id,title" },
      )
      .select("id")
      .single();

    if (variantError || !variantRow) {
      console.error(`    ❌ Variant "${v.title}":`, variantError?.message);
      continue;
    }

    // Upsert inventory
    const qty = typeof v.inventoryQuantity === "number" ? v.inventoryQuantity : 0;
    const { error: invError } = await supabase
      .from("inventory")
      .upsert(
        { variant_id: variantRow.id, quantity: qty, reserved: 0 },
        { onConflict: "variant_id" },
      );

    if (invError) {
      console.error(`    ❌ Inventory "${v.title}":`, invError.message);
    } else {
      migratedVariants++;
    }
  }

  return migratedVariants;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Iniciando migración Shopify → Supabase\n");

  console.log("⬇️  Descargando productos desde Shopify…");
  const products = await fetchAllProducts();
  console.log(`  ✅ ${products.length} productos encontrados\n`);

  console.log("⬆️  Importando a Supabase…");
  let totalVariants = 0;

  for (const product of products) {
    process.stdout.write(`  → ${product.title}… `);
    const count = await migrateProduct(product);
    totalVariants += count;
    console.log(`${count} variante(s) migradas`);
  }

  console.log(`\n✅ Migración completada:`);
  console.log(`   Productos: ${products.length}`);
  console.log(`   Variantes + inventario: ${totalVariants}`);
  console.log("\n💡 Ahora puedes desconectar Shopify (Fase 6 del plan).\n");
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
