import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { GLOSSARY, glossaryPath } from "@/lib/content/glossary";
import EditorialPageShell from "@/components/editorial/EditorialPageShell";
import { getBreadcrumbListJsonLd, getBaseUrl } from "@/lib/seo/schema";
import MedicalDisclaimer from "@/components/editorial/MedicalDisclaimer";
import GlossaryViewTracker from "./GlossaryViewTracker";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return GLOSSARY.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = GLOSSARY.find((g) => g.slug === params.slug);
  if (!entry) {
    return buildPageMetadata({
      path: `/insights/glossary/${params.slug}`,
      title: "Glossary term not found",
      metaDescription: "This glossary entry could not be found.",
      robots: { index: false, follow: false },
    });
  }
  return buildPageMetadata({
    path: glossaryPath(entry.slug),
    title: `${entry.term} — glossary`,
    metaDescription: entry.shortDefinition,
    appendBrand: true,
  });
}

function GlossaryJsonLd({
  slug,
  term,
  definition,
}: {
  slug: string;
  term: string;
  definition: string;
}) {
  const base = getBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getBreadcrumbListJsonLd(base, [
        { name: "Home", path: "/" },
        { name: "Insights", path: "/insights" },
        { name: "Glossary", path: "/insights" },
        { name: term, path: glossaryPath(slug) },
      ]),
      {
        "@type": "DefinedTerm",
        name: term,
        description: definition,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "Hair Longevity Institute glossary",
          url: `${base}/insights`,
        },
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default function GlossaryTermPage({ params }: Props) {
  const entry = GLOSSARY.find((g) => g.slug === params.slug);
  if (!entry) notFound();

  return (
    <EditorialPageShell theme="light">
      <GlossaryViewTracker slug={entry.slug} term={entry.term} />
      <GlossaryJsonLd slug={entry.slug} term={entry.term} definition={entry.shortDefinition} />
      <div className="py-12 sm:py-16">
        <nav className="text-sm text-[rgb(var(--text-muted))]" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-medical">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/insights" className="hover:text-medical">
                Insights
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[rgb(var(--text-primary))]">{entry.term}</li>
          </ol>
        </nav>
        <article className="mx-auto mt-8 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">{entry.term}</h1>
          <p className="mt-6 text-[rgb(var(--text-secondary))] leading-relaxed">{entry.shortDefinition}</p>
          <div className="mt-8">
            <MedicalDisclaimer compact />
          </div>
          <p className="mt-8">
            <Link href="/insights" className="font-semibold text-medical hover:underline">
              ← Back to insights
            </Link>
          </p>
        </article>
      </div>
    </EditorialPageShell>
  );
}
