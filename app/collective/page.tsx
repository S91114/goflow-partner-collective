import { OFFERS } from "@/lib/offers";
import { CollectiveCatalog } from "../CollectiveCatalog";

export const dynamic = "force-dynamic";

export default async function CollectivePage() {
  return <CollectiveCatalog offers={OFFERS} />;
}
