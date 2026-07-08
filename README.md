# Goflow Partner Collective

A public landing page and marketplace catalog of the retail & marketplace
expansion programs Goflow can open for a brand. Visitors can browse the catalog
while the email login gate is paused, and request access or submit program
applications so Goflow can capture and route the lead. Registrations, program
requests, and click events are saved to Supabase and optionally emailed to the
Goflow team.

Built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase**.
Designed to deploy on **Vercel**.

## Getting started (local)

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + publishable key
npm run dev                  # http://localhost:3000
```

## Database

Run [`supabase/collective_leads.sql`](supabase/collective_leads.sql) once in
your Supabase project's SQL editor. It creates the `leads` table and the
row-level-security policies (public can submit, only your team can read).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase publishable (anon) key |
| `SUPABASE_SECRET_KEY` | — | Server-only key used by API routes for admin writes once the gate is re-enabled |
| `COLLECTIVE_NOTIFY_EMAIL` | — | Where interest notifications go (default `sadya@goflow.com`) |
| `RESEND_API_KEY` | — | Enables email notifications via [Resend](https://resend.com) |
| `COLLECTIVE_NOTIFY_FROM` | — | From-address for notification emails |

## Editing the catalog

The offers live in [`lib/offers.ts`](lib/offers.ts) as a typed array — edit
that file to add, remove, or update a program. The `tags`/`filters` fields are
also the inputs for the planned "answer a few questions → get recommended
offers" intake flow.

## Deploy

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables above in the Vercel project settings.
4. Deploy.
