alter table public.credit_logs
  add column if not exists order_id text;

alter table public.credit_logs
  add column if not exists balance_after integer;

create table if not exists public.payment_orders (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_kind text not null,
  amount_cny integer not null,
  credits integer not null,
  status text not null default 'pending',
  payment_method text not null default 'manual',
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_orders_user_created_idx
  on public.payment_orders (user_id, created_at desc);

create index if not exists payment_orders_status_created_idx
  on public.payment_orders (status, created_at desc);

alter table public.payment_orders enable row level security;
