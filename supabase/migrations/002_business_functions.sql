-- ============================================================
-- RONIN — Funciones SQL de negocio
-- Ejecutar DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- ────────────────────────────────────────────────
-- increment_reserved: reserva stock de forma atómica
-- ────────────────────────────────────────────────
create or replace function public.increment_reserved(p_variant_id uuid, p_amount int)
returns void
language plpgsql
security definer
as $$
begin
  update public.inventory
  set reserved = reserved + p_amount
  where variant_id = p_variant_id;
end;
$$;

-- ────────────────────────────────────────────────
-- confirm_stock: descuenta stock real al confirmar pago
-- ────────────────────────────────────────────────
create or replace function public.confirm_stock(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  item record;
begin
  for item in
    select variant_id, quantity from public.order_items where order_id = p_order_id
  loop
    update public.inventory
    set
      quantity = greatest(quantity - item.quantity, 0),
      reserved = greatest(reserved - item.quantity, 0)
    where variant_id = item.variant_id;
  end loop;
end;
$$;

-- ────────────────────────────────────────────────
-- release_reserved: libera stock reservado si pago falla
-- ────────────────────────────────────────────────
create or replace function public.release_reserved(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  item record;
begin
  for item in
    select variant_id, quantity from public.order_items where order_id = p_order_id
  loop
    update public.inventory
    set reserved = greatest(reserved - item.quantity, 0)
    where variant_id = item.variant_id;
  end loop;
end;
$$;
