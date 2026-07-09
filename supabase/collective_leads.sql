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
grant insert on table public.program_applications to anon, authenticated;
grant insert on table public.program_events to anon, authenticated;

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
drop policy if exists "Anyone can submit program applications" on public.program_applications;
create policy "Anyone can submit program applications"
  on public.program_applications
  for insert
  to anon, authenticated
  with check (
    (
      ((select auth.uid()) is null and user_id is null)
      or ((select auth.uid()) = user_id)
    )
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
drop policy if exists "Anyone can create program events" on public.program_events;
create policy "Anyone can create program events"
  on public.program_events
  for insert
  to anon, authenticated
  with check (
    (
      ((select auth.uid()) is null and user_id is null)
      or ((select auth.uid()) = user_id)
    )
    and length(event_type) > 0
  );

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

-- Customer/application linking + email automation event log.
-- This creates one canonical customer row per email and links registrations,
-- profile records, program requests, selected program interests, and emails.
create table if not exists public.customers (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  first_seen_at        timestamptz not null default now(),
  last_seen_at         timestamptz not null default now(),
  user_id              uuid unique references auth.users(id) on delete set null,
  email                text not null unique,
  name                 text,
  company              text,
  website              text,
  category             text,
  gmv_band             text,
  current_channels     text,
  notes                text,
  lifecycle_status     text not null default 'lead',
  last_registration_id uuid references public.registrations(id) on delete set null,
  source               text not null default 'partner-collective',
  metadata             jsonb not null default '{}'::jsonb
);

alter table public.registrations
  add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.profiles
  add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.program_applications
  add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.program_events
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create table if not exists public.customer_program_interests (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  customer_id            uuid not null references public.customers(id) on delete cascade,
  program_application_id uuid references public.program_applications(id) on delete set null,
  offer_id               text not null,
  offer_name             text not null,
  request_type           text not null,
  status                 text not null default 'requested',
  details                jsonb not null default '{}'::jsonb,
  unique (customer_id, offer_id)
);

create table if not exists public.email_automation_events (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  customer_id            uuid references public.customers(id) on delete set null,
  program_application_id uuid references public.program_applications(id) on delete set null,
  registration_id        uuid references public.registrations(id) on delete set null,
  template               text not null,
  recipient_email        text not null,
  subject                text not null,
  status                 text not null default 'triggered',
  sent_at                timestamptz,
  error                  text,
  metadata               jsonb not null default '{}'::jsonb
);

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_customer_program_interests_updated_at on public.customer_program_interests;
create trigger set_customer_program_interests_updated_at
  before update on public.customer_program_interests
  for each row
  execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.customer_program_interests enable row level security;
alter table public.email_automation_events enable row level security;

revoke all on table public.customers from anon, authenticated;
revoke all on table public.customer_program_interests from anon, authenticated;
revoke all on table public.email_automation_events from anon, authenticated;

drop policy if exists "No client reads customers" on public.customers;
create policy "No client reads customers"
  on public.customers
  for select
  to anon, authenticated
  using (false);

drop policy if exists "No client writes customers" on public.customers;
drop policy if exists "No client creates customers" on public.customers;
create policy "No client creates customers"
  on public.customers
  for insert
  to anon, authenticated
  with check (false);

drop policy if exists "No client updates customers" on public.customers;
create policy "No client updates customers"
  on public.customers
  for update
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No client deletes customers" on public.customers;
create policy "No client deletes customers"
  on public.customers
  for delete
  to anon, authenticated
  using (false);

drop policy if exists "No client reads customer program interests" on public.customer_program_interests;
create policy "No client reads customer program interests"
  on public.customer_program_interests
  for select
  to anon, authenticated
  using (false);

drop policy if exists "No client writes customer program interests" on public.customer_program_interests;
drop policy if exists "No client creates customer program interests" on public.customer_program_interests;
create policy "No client creates customer program interests"
  on public.customer_program_interests
  for insert
  to anon, authenticated
  with check (false);

drop policy if exists "No client updates customer program interests" on public.customer_program_interests;
create policy "No client updates customer program interests"
  on public.customer_program_interests
  for update
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No client deletes customer program interests" on public.customer_program_interests;
create policy "No client deletes customer program interests"
  on public.customer_program_interests
  for delete
  to anon, authenticated
  using (false);

drop policy if exists "No client reads email automation events" on public.email_automation_events;
create policy "No client reads email automation events"
  on public.email_automation_events
  for select
  to anon, authenticated
  using (false);

drop policy if exists "No client writes email automation events" on public.email_automation_events;
drop policy if exists "No client creates email automation events" on public.email_automation_events;
create policy "No client creates email automation events"
  on public.email_automation_events
  for insert
  to anon, authenticated
  with check (false);

drop policy if exists "No client updates email automation events" on public.email_automation_events;
create policy "No client updates email automation events"
  on public.email_automation_events
  for update
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No client deletes email automation events" on public.email_automation_events;
create policy "No client deletes email automation events"
  on public.email_automation_events
  for delete
  to anon, authenticated
  using (false);

create index if not exists customers_created_at_idx on public.customers (created_at desc);
create index if not exists customers_email_idx on public.customers (lower(email));
create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_company_idx on public.customers (company);
create index if not exists customers_last_registration_id_idx on public.customers (last_registration_id);

create index if not exists registrations_customer_id_idx on public.registrations (customer_id);
create index if not exists profiles_customer_id_idx on public.profiles (customer_id);
create index if not exists program_applications_customer_id_idx on public.program_applications (customer_id);
create index if not exists program_events_customer_id_idx on public.program_events (customer_id);

create index if not exists customer_program_interests_customer_id_idx on public.customer_program_interests (customer_id);
create index if not exists customer_program_interests_program_application_id_idx on public.customer_program_interests (program_application_id);
create index if not exists customer_program_interests_offer_id_idx on public.customer_program_interests (offer_id);
create index if not exists customer_program_interests_status_idx on public.customer_program_interests (status);
create index if not exists customer_program_interests_created_at_idx on public.customer_program_interests (created_at desc);

create index if not exists email_automation_events_customer_id_idx on public.email_automation_events (customer_id);
create index if not exists email_automation_events_program_application_id_idx on public.email_automation_events (program_application_id);
create index if not exists email_automation_events_registration_id_idx on public.email_automation_events (registration_id);
create index if not exists email_automation_events_recipient_email_idx on public.email_automation_events (lower(recipient_email));
create index if not exists email_automation_events_created_at_idx on public.email_automation_events (created_at desc);

insert into public.customers (
  email,
  name,
  company,
  website,
  category,
  gmv_band,
  current_channels,
  notes,
  first_seen_at,
  last_seen_at,
  last_registration_id
)
select distinct on (lower(email))
  lower(email),
  name,
  company,
  website,
  category,
  gmv_band,
  current_channels,
  notes,
  created_at,
  created_at,
  id
from public.registrations
where email is not null
order by lower(email), created_at desc
on conflict (email) do update set
  name = coalesce(excluded.name, public.customers.name),
  company = coalesce(excluded.company, public.customers.company),
  website = coalesce(excluded.website, public.customers.website),
  category = coalesce(excluded.category, public.customers.category),
  gmv_band = coalesce(excluded.gmv_band, public.customers.gmv_band),
  current_channels = coalesce(excluded.current_channels, public.customers.current_channels),
  notes = coalesce(excluded.notes, public.customers.notes),
  last_seen_at = greatest(public.customers.last_seen_at, excluded.last_seen_at),
  last_registration_id = coalesce(excluded.last_registration_id, public.customers.last_registration_id);

insert into public.customers (
  email,
  name,
  company,
  website,
  first_seen_at,
  last_seen_at
)
select distinct on (lower(email))
  lower(email),
  name,
  company,
  website,
  created_at,
  created_at
from public.program_applications
where email is not null
order by lower(email), created_at desc
on conflict (email) do update set
  name = coalesce(excluded.name, public.customers.name),
  company = coalesce(excluded.company, public.customers.company),
  website = coalesce(excluded.website, public.customers.website),
  last_seen_at = greatest(public.customers.last_seen_at, excluded.last_seen_at);

update public.registrations r
set customer_id = c.id
from public.customers c
where r.customer_id is null and lower(r.email) = c.email;

update public.program_applications p
set customer_id = c.id
from public.customers c
where p.customer_id is null and lower(p.email) = c.email;

update public.profiles p
set customer_id = c.id
from public.customers c
where p.customer_id is null and lower(p.email) = c.email;

insert into public.customer_program_interests (
  customer_id,
  program_application_id,
  offer_id,
  offer_name,
  request_type,
  details
)
select
  customer_id,
  id,
  offer_id,
  offer_name,
  request_type,
  details
from public.program_applications
where customer_id is not null and offer_id <> 'general'
on conflict (customer_id, offer_id) do update set
  program_application_id = excluded.program_application_id,
  offer_name = excluded.offer_name,
  request_type = excluded.request_type,
  details = excluded.details,
  updated_at = now();
