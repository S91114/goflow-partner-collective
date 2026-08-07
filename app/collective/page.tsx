import { redirect } from "next/navigation";

export default async function CollectivePage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string | string[] }>;
}) {
  const { offer } = await searchParams;
  const offerId = typeof offer === "string" ? offer : undefined;

  redirect(offerId ? `/?offer=${encodeURIComponent(offerId)}` : "/");
}
