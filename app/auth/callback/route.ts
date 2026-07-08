import { NextResponse } from "next/server";
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
        const { data: registration } = readClient
          ? await readClient
          .from("registrations")
          .select("*")
          .eq("email", email.toLowerCase())
          .order("created_at", { ascending: false })
          .limit(1)
              .maybeSingle()
          : { data: null };

        if (registration) {
          await readClient!.from("profiles").upsert(
            {
              user_id: userId,
              email: email.toLowerCase(),
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
              email: email.toLowerCase(),
            },
            { onConflict: "user_id" },
          );
        }
      } catch (err) {
        console.error("[collective] profile upsert failed:", err);
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
