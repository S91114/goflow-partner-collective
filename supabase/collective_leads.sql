-- Goflow Partner Collective — access gate, profile, application, and event tables
-- Run this in the Supabase SQL editor for the Partner Collective project.
-- Safe to run more than once (idempotent).
-- Project: https://vbeoijigsfemmflfpfni.supabase.co

create extension if not exists pgcrypto;

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

-- Row Level Security: API routes write with SUPABASE_SECRET_KEY. Site visitors
-- never read the collected lead/application data through the Data API.
alter table public.leads enable row level security;

drop policy if exists "Public can submit leads" on public.leads;
drop policy if exists "Authenticated can read leads" on public.leads;
drop policy if exists "No client reads leads" on public.leads;
create policy "No client reads leads"
  on public.leads
  for select
  to anon, authenticated
  using (false);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_offer_id_idx on public.leads (offer_id);
create index if not exists leads_email_idx on public.leads (lower(email));

create table if not exists public.registrations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  status           text not null default 'access_sent',
  user_id          uuid references auth.users(id) on delete set null,
  name             text not null,
  email            text not null,
  company          text not null,
  website          text,
  category         text not null,
  gmv_band         text not null,
  current_channels text,
  notes            text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_term         text,
  utm_content      text,
  referrer         text,
  landing_path     text,
  source           text not null default 'partner-collective'
);

create table if not exists public.profiles (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  email                text not null,
  name                 text,
  company              text,
  website              text,
  category             text,
  gmv_band             text,
  current_channels     text,
  notes                text,
  last_registration_id uuid references public.registrations(id) on delete set null
);

create table if not exists public.program_applications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  user_id          uuid references auth.users(id) on delete set null,
  offer_id         text not null,
  offer_name       text not null,
  request_type     text not null,
  name             text not null,
  email            text not null,
  company          text not null,
  website          text,
  details          jsonb not null default '{}'::jsonb,
  profile_snapshot jsonb not null default '{}'::jsonb,
  outbound_url     text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_term         text,
  utm_content      text,
  referrer         text,
  landing_path     text,
  source           text not null default 'partner-collective'
);

create table if not exists public.program_events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  user_id      uuid references auth.users(id) on delete set null,
  offer_id     text,
  offer_name   text,
  event_type   text not null,
  metadata     jsonb not null default '{}'::jsonb,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text,
  referrer     text,
  landing_path text,
  source       text not null default 'partner-collective'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.registrations enable row level security;
alter table public.profiles enable row level security;
alter table public.program_applications enable row level security;
alter table public.program_events enable row level security;

-- Remove overly broad Data API table privileges; server routes write with SUPABASE_SECRET_KEY.
revoke all on table public.leads from anon, authenticated;
revoke all on table public.registrations from anon, authenticated;
revoke all on table public.program_applications from anon, authenticated;
revoke all on table public.program_events from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;

grant insert on table public.registrations to anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant insert on table public.program_applications to authenticated;
grant insert on table public.program_events to authenticated;

drop policy if exists "Anyone can request access" on public.registrations;
create policy "Anyone can request access"
  on public.registrations
  for insert
  to anon, authenticated
  with check (
    length(email) > 3
    and length(name) > 0
    and length(company) > 0
    and length(category) > 0
    and length(gmv_band) > 0
  );

drop policy if exists "No client reads registrations" on public.registrations;
create policy "No client reads registrations"
  on public.registrations
  for select
  to anon, authenticated
  using (false);

drop policy if exists "No client reads program applications" on public.program_applications;
create policy "No client reads program applications"
  on public.program_applications
  for select
  to anon, authenticated
  using (false);

drop policy if exists "Users can submit their own program applications" on public.program_applications;
create policy "Users can submit their own program applications"
  on public.program_applications
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and length(email) > 3
    and length(offer_id) > 0
    and length(offer_name) > 0
    and length(request_type) > 0
  );

drop policy if exists "No client reads program events" on public.program_events;
create policy "No client reads program events"
  on public.program_events
  for select
  to anon, authenticated
  using (false);

drop policy if exists "Users can create their own program events" on public.program_events;
create policy "Users can create their own program events"
  on public.program_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and length(event_type) > 0);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registrations_email_idx on public.registrations (lower(email));
create index if not exists registrations_user_id_idx on public.registrations (user_id);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_last_registration_id_idx on public.profiles (last_registration_id);

create index if not exists program_applications_created_at_idx on public.program_applications (created_at desc);
create index if not exists program_applications_user_id_idx on public.program_applications (user_id);
create index if not exists program_applications_offer_id_idx on public.program_applications (offer_id);
create index if not exists program_applications_email_idx on public.program_applications (lower(email));

create index if not exists program_events_created_at_idx on public.program_events (created_at desc);
create index if not exists program_events_user_id_idx on public.program_events (user_id);
create index if not exists program_events_offer_id_idx on public.program_events (offer_id);
create index if not exists program_events_event_type_idx on public.program_events (event_type);
