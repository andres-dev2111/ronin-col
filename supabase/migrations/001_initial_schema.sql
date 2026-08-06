-- ============================================================
-- RONIN — Schema inicial
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Habilitar uuid-ossp para gen_random_uuid()
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────
-- 1. PRODUCTS
-- ────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null unique,          -- slug para URL: /products/[handle]
  title       text not null,
  description text,
  images      jsonb not null default '[]',   -- [{url, altText}]
  tags        text[] not null default '{}',
  status      text not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 2. PRODUCT_VARIANTS
-- ────────────────────────────────────────────────
create table if not exists public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  sku             text,
  title           text not null,                 -- "S", "M / Negro", etc.
  price           numeric(12,2) not null,
  compare_at_price numeric(12,2),
  currency_code   text not null default 'COP',
  selected_options jsonb not null default '[]',  -- [{name:"Talla",value:"M"}]
  position        int not null default 0,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 3. INVENTORY
-- ────────────────────────────────────────────────
create table if not exists public.inventory (
  id         uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references public.product_variants(id) on delete cascade,
  quantity   int not null default 0 check (quantity >= 0),
  reserved   int not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now()
);

-- Vista de stock disponible real
create or replace view public.inventory_available as
  select
    variant_id,
    quantity,
    reserved,
    greatest(quantity - reserved, 0) as available
  from public.inventory;

-- ────────────────────────────────────────────────
-- 4. CUSTOMERS
-- ────────────────────────────────────────────────
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  phone           text,
  document_type   text not null default 'CC' check (document_type in ('CC', 'CE', 'NIT', 'PAS')),
  document_number text not null,
  address_line1   text not null,
  address_line2   text,
  city            text not null,
  department      text not null,
  postal_code     text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 5. ORDERS
-- ────────────────────────────────────────────────
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      serial,                       -- número legible: 1001, 1002…
  customer_id       uuid references public.customers(id),
  status            text not null default 'pending'
                    check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  payment_status    text not null default 'pending'
                    check (payment_status in ('pending','approved','rejected','refunded','in_process')),
  payment_method    text,                         -- 'mercadopago', 'stripe', etc.
  payment_reference text,                         -- ID externo del pago (MP preference_id / payment_id)
  subtotal          numeric(12,2) not null,
  shipping_cost     numeric(12,2) not null default 0,
  total             numeric(12,2) not null,
  currency_code     text not null default 'COP',
  metadata          jsonb not null default '{}',  -- datos extra del webhook
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Número de pedido legible: empieza en 1001
create sequence if not exists public.order_number_seq start 1001;
alter table public.orders alter column order_number set default nextval('public.order_number_seq');

-- ────────────────────────────────────────────────
-- 6. ORDER_ITEMS
-- ────────────────────────────────────────────────
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  variant_id      uuid not null references public.product_variants(id),
  product_title   text not null,                 -- snapshot del título al momento de la compra
  variant_title   text not null,
  quantity        int not null check (quantity > 0),
  unit_price      numeric(12,2) not null,
  total_price     numeric(12,2) generated always as (quantity * unit_price) stored
);

-- ────────────────────────────────────────────────
-- 7. SHIPPING_CONFIG
-- ────────────────────────────────────────────────
create table if not exists public.shipping_config (
  id                  uuid primary key default gen_random_uuid(),
  label               text not null default 'Envío estándar Colombia',
  fixed_cost          numeric(12,2) not null default 10000,  -- $10.000 COP por defecto
  free_shipping_above numeric(12,2) default 150000,          -- gratis si subtotal >= $150.000
  currency_code       text not null default 'COP',
  active              boolean not null default true,
  updated_at          timestamptz not null default now()
);

-- Insertar configuración inicial
insert into public.shipping_config (label, fixed_cost, free_shipping_above)
values ('Envío estándar Colombia', 10000, 150000)
on conflict do nothing;

-- ────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────
create index if not exists idx_products_status   on public.products(status);
create index if not exists idx_products_tags      on public.products using gin(tags);
create index if not exists idx_variants_product   on public.product_variants(product_id);
create index if not exists idx_orders_status      on public.orders(status);
create index if not exists idx_orders_customer    on public.orders(customer_id);
create index if not exists idx_order_items_order  on public.order_items(order_id);

-- ────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inventory_updated_at on public.inventory;
create trigger trg_inventory_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────

-- Products: lectura pública, escritura solo service_role
alter table public.products enable row level security;
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (status = 'active');
drop policy if exists "products_service_write" on public.products;
create policy "products_service_write" on public.products for all using (auth.role() = 'service_role');

-- Product variants: lectura pública
alter table public.product_variants enable row level security;
drop policy if exists "variants_public_read" on public.product_variants;
create policy "variants_public_read" on public.product_variants for select using (true);
drop policy if exists "variants_service_write" on public.product_variants;
create policy "variants_service_write" on public.product_variants for all using (auth.role() = 'service_role');

-- Inventory: lectura pública (solo disponible), escritura service_role
alter table public.inventory enable row level security;
drop policy if exists "inventory_public_read" on public.inventory;
create policy "inventory_public_read" on public.inventory for select using (true);
drop policy if exists "inventory_service_write" on public.inventory;
create policy "inventory_service_write" on public.inventory for all using (auth.role() = 'service_role');

-- Shipping config: lectura pública
alter table public.shipping_config enable row level security;
drop policy if exists "shipping_public_read" on public.shipping_config;
create policy "shipping_public_read" on public.shipping_config for select using (active = true);
drop policy if exists "shipping_service_write" on public.shipping_config;
create policy "shipping_service_write" on public.shipping_config for all using (auth.role() = 'service_role');

-- Customers: solo service_role
alter table public.customers enable row level security;
drop policy if exists "customers_service_only" on public.customers;
create policy "customers_service_only" on public.customers for all using (auth.role() = 'service_role');

-- Orders: solo service_role
alter table public.orders enable row level security;
drop policy if exists "orders_service_only" on public.orders;
create policy "orders_service_only" on public.orders for all using (auth.role() = 'service_role');

-- Order items: solo service_role
alter table public.order_items enable row level security;
drop policy if exists "order_items_service_only" on public.order_items;
create policy "order_items_service_only" on public.order_items for all using (auth.role() = 'service_role');
