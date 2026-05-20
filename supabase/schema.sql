create table if not exists public.app_users (
  id text primary key,
  email text unique,
  name text not null,
  avatar text,
  provider text not null default 'email',
  credits integer not null default 5,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

create table if not exists public.verification_codes (
  email text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.generation_history (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  product_name text not null,
  category text not null,
  target_market text not null,
  platform text not null,
  copywriting_style text,
  result jsonb not null,
  usage jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists generation_history_user_created_idx
  on public.generation_history (user_id, created_at desc);

create table if not exists public.credit_logs (
  id bigserial primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  change integer not null,
  reason text not null,
  order_id text,
  history_id text references public.generation_history(id) on delete set null,
  balance_after integer,
  created_at timestamptz not null default now()
);

alter table public.credit_logs
  add column if not exists order_id text;

alter table public.credit_logs
  add column if not exists balance_after integer;

create index if not exists credit_logs_user_created_idx
  on public.credit_logs (user_id, created_at desc);

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
