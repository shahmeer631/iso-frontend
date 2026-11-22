import type { Metadata } from "next";
import Link from "next/link";
import { Award } from "lucide-react";

type VerifyPageProps = {
  params: Promise<{ lang: string; id: string }> | { lang: string; id: string };
};

async function resolveParams(params: VerifyPageProps["params"]) {
  return typeof (params as any)?.then === "function"
    ? await (params as Promise<{ lang: string; id: string }>)
    : (params as { lang: string; id: string });
}

async function fetchCertificate(id: string) {
  const base =
    process.env.NEXT_PUBLIC_API_URL || "https://api.isobrain.ai/api/v1";
  try {
    const res = await fetch(`${base}/certificates/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: VerifyPageProps): Promise<Metadata> {
  const { id } = await resolveParams(params);
  const cert = await fetchCertificate(id);
  const studentName = cert?.studentName || "ISOBrain Learner";
  const title = `${studentName} — ISO Mastery Lab Certificate of Competency`;
  const description = [
    "Verified CPD Certificate of Competency from ISOBrain Mastery Lab.",
    cert?.industry ? `Industry: ${cert.industry}.` : "",
    cert?.managementLevel ? `Level: ${cert.managementLevel}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const image =
    cert?.imageUrl ||
    cert?.template?.backgroundImageUrl ||
    "https://isobrain.ai/og-certificate-default.png";
  const url = `https://isobrain.ai/en/verify/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function VerifyCertificatePage({
  params,
}: VerifyPageProps) {
  const { lang, id } = await resolveParams(params);
  const cert = await fetchCertificate(id);

  if (!cert) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <Award className="mb-4 text-[var(--ib-mute)]" size={40} />
        <h1 className="text-2xl font-bold text-[var(--ib-ink)]">
          Certificate not found
        </h1>
        <p className="mt-2 text-[var(--ib-mute)]">
          This verification link is invalid or the certificate was removed.
        </p>
        <Link
          href={`/${lang}/mastery-lab`}
          className="mt-6 rounded-full bg-[var(--ib-acc)] px-6 py-3 text-sm font-semibold text-white"
        >
          Take Mastery Lab
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--ib-accbg)]">
        <Award className="text-[var(--ib-acc)]" size={28} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ib-acc)]">
        Verified credential
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ib-ink)]">
        {cert.studentName || "ISOBrain Learner"}
      </h1>
      <p className="mt-2 text-lg text-[var(--ib-mute)]">
        ISO Mastery Lab — Certificate of Competency
      </p>
      <dl className="mt-8 grid w-full max-w-md gap-3 text-left text-sm">
        {cert.industry ? (
          <div className="flex justify-between gap-4 border-b border-[var(--ib-line)] pb-2">
            <dt className="text-[var(--ib-mute)]">Industry</dt>
            <dd className="font-semibold text-[var(--ib-ink)]">{cert.industry}</dd>
          </div>
        ) : null}
        {cert.managementLevel ? (
          <div className="flex justify-between gap-4 border-b border-[var(--ib-line)] pb-2">
            <dt className="text-[var(--ib-mute)]">Level</dt>
            <dd className="font-semibold text-[var(--ib-ink)]">
              {cert.managementLevel}
            </dd>
          </div>
        ) : null}
        {cert.jobFunction ? (
          <div className="flex justify-between gap-4 border-b border-[var(--ib-line)] pb-2">
            <dt className="text-[var(--ib-mute)]">Function</dt>
            <dd className="font-semibold text-[var(--ib-ink)]">
              {cert.jobFunction}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-b border-[var(--ib-line)] pb-2">
          <dt className="text-[var(--ib-mute)]">Certificate ID</dt>
          <dd className="break-all font-mono text-xs font-semibold text-[var(--ib-ink)]">
            {id}
          </dd>
        </div>
      </dl>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href={`/${lang}/mastery-lab`}
          className="rounded-full bg-[var(--ib-acc)] px-6 py-3 text-sm font-semibold text-white"
        >
          Take Mastery Lab
        </Link>
        <a
          href="https://dashboard.isobrain.ai/user/certificates"
          className="rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] px-6 py-3 text-sm font-semibold text-[var(--ib-ink)]"
        >
          Open dashboard
        </a>
      </div>
    </main>
  );
}
