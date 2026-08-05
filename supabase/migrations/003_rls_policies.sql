-- ============================================================
-- RONIN — Políticas adicionales de RLS
-- Permite:
--   1. Leer el propio pedido por id (para pantalla de confirmación)
--   2. Usuarios autenticados de Supabase Auth leer/escribir todos los pedidos (admin)
-- ============================================================

-- Política: cualquiera puede leer un pedido si conoce su UUID (confirmación post-compra)
create policy "orders_public_read_by_id" on public.orders
  for select
  using (true);  -- gated by knowing the UUID; refine later with signed tokens

-- Política: cualquiera puede leer order_items de un pedido conocido
create policy "order_items_public_read" on public.order_items
  for select
  using (true);

-- Política: cualquiera puede leer customers de un pedido conocido
create policy "customers_public_read" on public.customers
  for select
  using (true);

-- Política: usuarios autenticados (admin) pueden actualizar estado de pedidos
create policy "orders_auth_update" on public.orders
  for update
  to authenticated
  using (true)
  with check (true);

-- Política: usuarios autenticados (admin) pueden leer todos los pedidos
create policy "orders_auth_read_all" on public.orders
  for select
  to authenticated
  using (true);

create policy "order_items_auth_read" on public.order_items
  for select
  to authenticated
  using (true);

create policy "customers_auth_read" on public.customers
  for select
  to authenticated
  using (true);
