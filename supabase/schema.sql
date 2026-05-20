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
  history_id text references public.generation_history(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists credit_logs_user_created_idx
  on public.credit_logs (user_id, created_at desc);
