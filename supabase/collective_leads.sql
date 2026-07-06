-- Goflow Partner Collective — leads table
-- Run this in the Supabase SQL editor for the Partner Collective project.
-- Safe to run more than once (idempotent).
-- Project: https://vbeoijigsfemmflfpfni.supabase.co

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  offer_id      text not null,
  offer_name    text not null,
  name          text not null,
  email         text not null,
  company       text not null,
  website       text,
  monthly_units text,
  details       jsonb not null default '{}'::jsonb,
  source        text not null default 'partner-collective'
);

-- If the table already existed from V1, add the newer columns.
alter table public.leads add column if not exists website text;
alter table public.leads add column if not exists details jsonb not null default '{}'::jsonb;

-- Row Level Security: the public form may INSERT, but only authenticated
-- users (your Goflow team) may READ the collected leads.
alter table public.leads enable row level security;

drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated can read leads" on public.leads;
create policy "Authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_offer_id_idx on public.leads (offer_id);
