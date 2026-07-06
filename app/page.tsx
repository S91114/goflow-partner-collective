import { OFFERS } from "@/lib/offers";
import { CollectiveCatalog } from "./CollectiveCatalog";

export default function Home() {
  return <CollectiveCatalog offers={OFFERS} />;
}
