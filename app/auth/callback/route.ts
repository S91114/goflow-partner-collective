import { NextResponse } from "next/server";
import { updateCustomerRegistration, upsertCustomer } from "@/lib/customers";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/collective";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub as string | undefined;
    const email = data?.claims?.email as string | undefined;

    if (userId && email) {
      try {
        const readClient = hasAdminKey() ? createAdminClient() : null;
        const normalizedEmail = email.toLowerCase();
        const { data: registration } = readClient
          ? await readClient
              .from("registrations")
              .select("*")
              .eq("email", normalizedEmail)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : { data: null };

        const customerId = readClient
          ? await upsertCustomer(readClient, {
              userId,
              email: normalizedEmail,
              name: registration?.name,
              company: registration?.company,
              website: registration?.website,
              category: registration?.category,
              gmvBand: registration?.gmv_band,
              currentChannels: registration?.current_channels,
              notes: registration?.notes,
              lastRegistrationId: registration?.id,
            })
          : null;

        if (registration) {
          await updateCustomerRegistration(
            readClient!,
            customerId,
            registration.id,
          );
          await readClient!.from("profiles").upsert(
            {
              user_id: userId,
              customer_id: customerId,
              email: normalizedEmail,
              name: registration.name,
              company: registration.company,
              website: registration.website,
              category: registration.category,
              gmv_band: registration.gmv_band,
              current_channels: registration.current_channels,
              notes: registration.notes,
              last_registration_id: registration.id,
            },
            { onConflict: "user_id" },
          );
        } else {
          await supabase.from("profiles").upsert(
            {
              user_id: userId,
              customer_id: customerId,
              email: normalizedEmail,
            },
            { onConflict: "user_id" },
          );
        }

        if (readClient && customerId) {
          await Promise.all([
            readClient
              .from("registrations")
              .update({ user_id: userId, customer_id: customerId })
              .eq("email", normalizedEmail),
            readClient
              .from("program_applications")
              .update({ user_id: userId, customer_id: customerId })
              .eq("email", normalizedEmail),
            readClient
              .from("program_events")
              .update({ user_id: userId, customer_id: customerId })
              .eq("metadata->>email", normalizedEmail),
          ]);
        }
      } catch (err) {
        console.error("[collective] profile upsert failed:", err);
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
