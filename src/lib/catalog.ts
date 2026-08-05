import { supabase } from "./supabase";

// ────────────────────────────────────────────────────────────────────────────────
// Shared types — mirror the shape of ShopifyProductNode so existing UI components
// keep working without changes. Only the data source changes.
// ────────────────────────────────────────────────────────────────────────────────

export interface CatalogImage {
  url: string;
  altText: string | null;
}

export interface CatalogVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  tags: string[];
  createdAt: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } } | null;
  images: { edges: Array<{ node: CatalogImage }> };
  variants: { edges: Array<{ node: CatalogVariant }> };
  options: Array<{ name: string; values: string[] }>;
}

// Shape used by HomeSections / ProductCard (matches ShopifyProduct wrapper)
export interface CatalogProductEdge {
  node: CatalogProduct;
}

// ────────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────────────

function rowToProduct(
  row: {
    id: string;
    title: string;
    description: string | null;
    handle: string;
    tags: string[];
    images: unknown;
    created_at: string;
  },
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compare_at_price: number | null;
    currency_code: string;
    selected_options: unknown;
    quantity?: number; // joined from inventory_available
  }>,
): CatalogProduct {
  const rawImages = (Array.isArray(row.images) ? row.images : []) as Array<{
    url: string;
    altText?: string | null;
  }>;

  const variantNodes: CatalogVariant[] = variants.map((v) => {
    const opts = (Array.isArray(v.selected_options) ? v.selected_options : []) as Array<{
      name: string;
      value: string;
    }>;
    return {
      id: v.id,
      title: v.title,
      price: { amount: String(v.price), currencyCode: v.currency_code },
      compareAtPrice: v.compare_at_price
        ? { amount: String(v.compare_at_price), currencyCode: v.currency_code }
        : null,
      availableForSale: (v.quantity ?? 0) > 0,
      selectedOptions: opts,
    };
  });

  const minPrice = variantNodes.reduce(
    (min, v) => (parseFloat(v.price.amount) < min ? parseFloat(v.price.amount) : min),
    variantNodes[0] ? parseFloat(variantNodes[0].price.amount) : 0,
  );

  const compareAtMin = variantNodes.find((v) => v.compareAtPrice)?.compareAtPrice ?? null;

  // Derive unique options from selected_options across all variants
  const optionMap = new Map<string, Set<string>>();
  variantNodes.forEach((v) => {
    v.selectedOptions.forEach(({ name, value }) => {
      if (!optionMap.has(name)) optionMap.set(name, new Set());
      optionMap.get(name)!.add(value);
    });
  });
  const options = Array.from(optionMap.entries()).map(([name, vals]) => ({
    name,
    values: Array.from(vals),
  }));

  const currencyCode = variantNodes[0]?.price.currencyCode ?? "COP";

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    handle: row.handle,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    priceRange: {
      minVariantPrice: { amount: String(minPrice), currencyCode },
    },
    compareAtPriceRange: compareAtMin ? { minVariantPrice: compareAtMin } : null,
    images: { edges: rawImages.map((img) => ({ node: { url: img.url, altText: img.altText ?? null } })) },
    variants: { edges: variantNodes.map((n) => ({ node: n })) },
    options,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// Public API — same signatures as the old shopify.ts functions
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Fetch active products. Optionally filter by a tag (partial match).
 */
export async function fetchProducts(first = 12, tag?: string): Promise<CatalogProductEdge[]> {
  let query = supabase
    .from("products")
    .select("id, handle, title, description, images, tags, created_at")
    .eq("status", "active")
    .limit(first)
    .order("created_at", { ascending: false });

  if (tag) {
    const cleanTag = tag.replace(/tag:|title:/gi, "").trim().split(" OR ")[0].trim();
    query = query.contains("tags", [cleanTag]);
  }

  const { data: productsData, error: productsError } = await query;
  if (productsError) {
    console.error("[catalog] fetchProducts error:", productsError);
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (productsData as any[]) ?? [];
  if (!products.length) return [];

  const productIds = products.map((p: any) => p.id as string);

  const { data: variantsData } = await supabase
    .from("product_variants")
    .select(
      `id, product_id, title, price, compare_at_price, currency_code, selected_options,
       inventory_available(available)`,
    )
    .in("product_id", productIds)
    .order("position");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantsList = (variantsData as any[]) ?? [];

  const variantsByProduct = new Map<string, any[]>();
  variantsList.forEach((v: any) => {
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
    variantsByProduct.get(v.product_id)!.push(v);
  });

  return products.map((p: any) => {
    const variants = (variantsByProduct.get(p.id) ?? []).map((v: any) => ({
      ...v,
      quantity: (v?.inventory_available?.available ?? 0) as number,
    }));
    return { node: rowToProduct(p, variants) };
  });
}

/**
 * Fetch a single product by its URL handle.
 */
export async function fetchProductByHandle(handle: string): Promise<CatalogProduct | null> {
  const { data: productData, error } = await supabase
    .from("products")
    .select("id, handle, title, description, images, tags, created_at")
    .eq("handle", handle)
    .eq("status", "active")
    .single();

  if (error || !productData) {
    if (error?.code !== "PGRST116") console.error("[catalog] fetchProductByHandle error:", error);
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = productData as any;

  const { data: variantsData } = await supabase
    .from("product_variants")
    .select(
      `id, product_id, title, price, compare_at_price, currency_code, selected_options,
       inventory_available(available)`,
    )
    .eq("product_id", product.id)
    .order("position");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = ((variantsData as any[]) ?? []).map((v: any) => ({
    ...v,
    quantity: (v?.inventory_available?.available ?? 0) as number,
  }));

  return rowToProduct(product, variants);
}

/**
 * Fetch a collection (products tagged with the given handle/tag).
 * Returns an object with the same shape as the Shopify collection response.
 */
export async function fetchCollection(
  handle: string,
  first = 24,
): Promise<{
  id: string;
  title: string;
  description: string;
  image: CatalogImage | null;
  products: { edges: CatalogProductEdge[] };
} | null> {
  // Collections are implemented as tag-based groups.
  // handle "all" returns all active products.
  const tagFilter = handle === "all" ? undefined : handle;
  const edges = await fetchProducts(first, tagFilter);

  return {
    id: handle,
    title: handle === "all" ? "Todos los productos" : handle.replace(/-/g, " "),
    description: "",
    image: null,
    products: { edges },
  };
}

// Re-export formatPrice for components that import it from shopify.ts
// (convenience alias — no Shopify dependency)
export function formatPrice(amount: string | number, currencyCode = "COP") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(0)}`;
  }
}

/**
 * Fetch the active shipping configuration.
 */
export async function fetchShippingConfig() {
  const { data } = await supabase
    .from("shipping_config")
    .select("*")
    .eq("active", true)
    .single();

  return data ?? { fixed_cost: 10000, free_shipping_above: 150000, currency_code: "COP", label: "Envío estándar Colombia" };
}
