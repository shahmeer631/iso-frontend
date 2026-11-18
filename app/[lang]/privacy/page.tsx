import { redirect } from "next/navigation";

export default async function PrivacyRedirectPage({
  params,
}: {
  params: Promise<{ lang: string }> | { lang: string };
}) {
  const resolved = await Promise.resolve(params);
  redirect(`/${resolved.lang}/privacy-policy`);
}
