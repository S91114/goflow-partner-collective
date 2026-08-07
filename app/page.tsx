import { CollectiveCatalog } from "./CollectiveCatalog";
import { OFFERS } from "@/lib/offers";

export default function Home() {
  return <CollectiveCatalog offers={OFFERS} />;
}
