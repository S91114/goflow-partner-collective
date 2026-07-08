# Goflow Partner Collective — agent guide

A marketplace-style catalog of the retail & marketplace **expansion programs**
Goflow can open for a brand. Visitors browse tiles, open one for details, and
either **apply** (embedded HubSpot form or link-out) or **request an intro**
(our own form → Supabase). Built to deploy on **Vercel**.

## Stack
- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v3** (brand tokens in `app/globals.css`)
- **Supabase** (`leads` table) for interest-form submissions
- **Inter** self-hosted via `next/font/local` (stand-in for the paid brand font Euclid Circular A)

## Run it
```bash
npm install
cp .env.example .env.local   # fill in the Supabase values
npm run dev                  # http://localhost:3000
npm run build                # production build (also typechecks)
```

## Environment variables (see `.env.example`)
Values live in Vercel → Project Settings → Environment Variables (and your local
`.env.local`, which is git-ignored). **Never commit real values.**

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase publishable (anon) key |
| `COLLECTIVE_NOTIFY_EMAIL` | — | Where lead notifications go (default `sadya@goflow.com`) |
| `RESEND_API_KEY` | — | Enables lead-notification emails via Resend |
| `COLLECTIVE_NOTIFY_FROM` | — | From-address for those emails |

## Architecture / where things live
- **`lib/offers.ts`** — the catalog. Single source of truth for every tile.
  Each `Offer` is fully typed; to add/edit a tile, edit this file. Key optional
  fields: `logo`/`wordmark`, `website` ("Visit site" link), `apply` (`{ url,
  embed?, label? }` — `embed:true` iframes the form in the modal, else link-out),
  `link` (external "join" URL, used by the WhatsApp tile), `collect[]` (per-offer
  interest-form fields).
- **`app/CollectiveCatalog.tsx`** — hero + grid + modal state; syncs the open
  offer to `?offer=<id>` for shareable links. (Category filters were removed.)
- **`app/OfferModal.tsx`** — full-screen takeover. Right column priority:
  embedded apply form → apply link-out → WhatsApp join → interest form.
- **`app/InterestForm.tsx`** — dynamic form (base fields + `offer.collect[]`),
  POSTs to `/api/leads`.
- **`app/api/leads/route.ts`** — validates, inserts into Supabase `leads`,
  optionally emails via Resend.
- **`lib/supabase.ts`** — Supabase client. **`supabase/collective_leads.sql`** — schema.
- **`public/logos/*`** — brand marks. **`app/fonts/*`** — Inter woff2.

## Deploy
Vercel auto-deploys on push to `main`. Set the env vars above in the Vercel
project. Run `supabase/collective_leads.sql` once in the Supabase SQL editor.

## Outstanding TODO (as of this handoff)
- [ ] **Supabase columns**: run `supabase/collective_leads.sql` (adds `website` +
  `details`) so interest-form answers save.
- [ ] **WhatsApp link**: replace the placeholder `WHATSAPP_INVITE_URL` in
  `lib/offers.ts` with the real `https://chat.whatsapp.com/…` invite.
- [ ] **Best Buy**: has an apply link but no tile yet — decide between a
  dedicated tile vs. attaching it to the existing "Retail Expansion" tile.
- [ ] **Remaining apply links**: Amazon MCF, Amazon NSI, Walmart Customer
  Favorites, Lowe's, AliExpress, SHEIN, Temu, NocNoc, Retail Expansion still use
  the interest form; add `apply` links as they're provided.
- [ ] **Optional**: `RESEND_API_KEY` to turn on lead emails; swap Inter →
  licensed Euclid Circular A webfonts (`app/layout.tsx` + `app/fonts/`).
