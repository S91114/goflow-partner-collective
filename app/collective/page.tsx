import { redirect } from "next/navigation";
import { OFFERS } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";
import { CollectiveCatalog } from "../CollectiveCatalog";

export const dynamic = "force-dynamic";

export default async function CollectivePage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/");
  }

  return <CollectiveCatalog offers={OFFERS} />;
}
