import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import {
  getArticleBySlug,
  getRelatedByTaxonomy,
  getAllSlugs,
} from "@/lib/content/index";
import { HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";
import EditorialPageShell from "@/components/editorial/EditorialPageShell";
import ArticleJsonLd from "@/components/editorial/ArticleJsonLd";
import AuthorReviewerBlock from "@/components/editorial/AuthorReviewerBlock";
import MedicalDisclaimer from "@/components/editorial/MedicalDisclaimer";
import TableOfContents from "@/components/editorial/TableOfContents";
import RelatedArticles from "@/components/editorial/RelatedArticles";
import EditorialFaqSection from "@/components/editorial/EditorialFaqSection";
import ReferencesSection from "@/components/editorial/ReferencesSection";
import GlossaryTermLinks from "@/components/editorial/GlossaryTermLinks";
import NextStepBlocks from "@/components/editorial/NextStepBlocks";
import RelatedTopicsModule from "@/components/editorial/RelatedTopicsModule";
import ArticleGuideLinks from "@/components/editorial/ArticleGuideLinks";
import ArticlePillarStartLink from "@/components/editorial/ArticlePillarStartLink";
import { guideLinksForArticle } from "@/lib/content/pillarGuides";
import EditorialArticleViewTracker from "@/components/editorial/EditorialArticleViewTracker";
import EditorialArticleImage from "@/components/editorial/EditorialArticleImage";
import EditorialHeroCtas from "@/components/editorial/EditorialHeroCtas";
import InsightArticlePdfLink from "@/components/editorial/InsightArticlePdfLink";
import { isLongevityEnabled } from "@/lib/features";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return buildPageMetadata({
      path: `/insights/${params.slug}`,
      title: "Article not found",
      metaDescription: "The requested article could not be found.",
      appendBrand: true,
      robots: { index: false, follow: false },
    });
  }
  const path = `/insights/${article.slug}`;
  return buildPageMetadata({
    path,
    title: article.seoTitle ?? article.title,
    metaDescription: article.description,
    appendBrand: true,
    openGraphType: "article",
    article: {
      publishedTime: `${article.publishedAt}T00:00:00.000Z`,
      modifiedTime: article.updatedAt ? `${article.updatedAt}T00:00:00.000Z` : undefined,
    },
  });
}

export default function EditorialArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = getRelatedByTaxonomy(article, 4);
  const url = absoluteUrl(`/insights/${article.slug}`);
  const useLongevity = isLongevityEnabled();
  const assessmentHref = useLongevity ? "/longevity/start" : "/start";

  const imageUrls = article.heroImage ? [absoluteUrl(article.heroImage.src)] : undefined;

  const Body = article.Body;

  return (
    <EditorialPageShell theme="light">
      <EditorialArticleViewTracker slug={article.slug} title={article.title} />
      <ArticleJsonLd
        url={url}
        headline={article.title}
        description={article.description}
        datePublished={`${article.publishedAt}T00:00:00.000Z`}
        dateModified={article.updatedAt ? `${article.updatedAt}T00:00:00.000Z` : undefined}
        authorNames={article.authors.map((a) => a.name)}
        imageUrls={imageUrls}
        faq={article.faq}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          { name: HUB_LABEL[article.hub], path: HUB_PATH[article.hub] },
          { name: article.title, path: `/insights/${article.slug}` },
        ]}
      />

      <article className="py-12 sm:py-16">
        <nav className="text-sm text-[rgb(var(--text-muted))]" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="rounded-sm underline-offset-2 hover:text-medical hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/insights" className="rounded-sm underline-offset-2 hover:text-medical hover:underline">
                Insights
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={HUB_PATH[article.hub]} className="rounded-sm underline-offset-2 hover:text-medical hover:underline">
                {HUB_LABEL[article.hub]}
              </Link>
            </li>
          </ol>
        </nav>

        <header className="mx-auto mt-8 max-w-4xl rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.92)_100%)] px-6 py-7 shadow-[0_18px_52px_rgba(0,0,0,0.06)] sm:px-8 sm:py-8">
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">{HUB_LABEL[article.hub]}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          {article.deck ? (
            <p className="mt-5 max-w-3xl text-lg text-[rgb(var(--text-secondary))] leading-relaxed sm:text-[1.15rem]">{article.deck}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2.5 text-sm text-[rgb(var(--text-muted))]">
            <span className="rounded-full border border-[rgb(var(--border-soft))] bg-white/85 px-3 py-1.5">
              Published <time dateTime={article.publishedAt}>{article.publishedAt}</time>
            </span>
            {article.updatedAt ? (
              <span className="rounded-full border border-[rgb(var(--border-soft))] bg-white/85 px-3 py-1.5">
                Updated <time dateTime={article.updatedAt}>{article.updatedAt}</time>
              </span>
            ) : null}
            {article.reviewedAt ? (
              <span className="rounded-full border border-[rgb(var(--border-soft))] bg-white/85 px-3 py-1.5">
                Last reviewed <time dateTime={article.reviewedAt}>{article.reviewedAt}</time>
              </span>
            ) : null}
          </div>
          <div className="mt-8">
            <ArticlePillarStartLink pillar={article.primaryPillar} />
          </div>
          <div className="mt-6">
            <EditorialHeroCtas assessmentHref={assessmentHref} ctaType={article.ctaType} />
          </div>
          {article.pdfHref ? (
            <InsightArticlePdfLink
              href={article.pdfHref}
              label={article.pdfLabel}
              fileSize={article.pdfFileSize}
            />
          ) : null}
        </header>

        {article.heroImage ? (
          <div className="mx-auto mt-10 max-w-4xl">
            <EditorialArticleImage
              src={article.heroImage.src}
              alt={article.heroImage.alt}
              width={article.heroImage.width}
              height={article.heroImage.height}
              caption={article.heroImage.caption}
              priority
            />
          </div>
        ) : null}

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[250px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <TableOfContents items={article.toc} />
          </aside>
          <div className="min-w-0 rounded-[2rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.06)] sm:p-8 md:p-10">
            <MedicalDisclaimer />
            <div className="editorial-prose mt-8 max-w-[72ch]">
              <Body />
            </div>
            {article.glossarySlugs?.length ? (
              <div className="mt-10">
                <GlossaryTermLinks slugs={article.glossarySlugs} />
              </div>
            ) : null}
            <div className="mt-10">
              <RelatedTopicsModule taxonomy={article.taxonomy} />
            </div>
            <div className="mt-10">
              <ArticleGuideLinks guides={guideLinksForArticle(article)} />
            </div>
            <div className="mt-12">
              <AuthorReviewerBlock authors={article.authors} reviewers={article.reviewers} />
            </div>
            {article.faq?.length ? (
              <div className="mt-12">
                <EditorialFaqSection items={article.faq} />
              </div>
            ) : null}
            {article.references?.length ? (
              <div className="mt-12">
                <ReferencesSection references={article.references} />
              </div>
            ) : null}
            <div className="mt-12">
              <RelatedArticles articles={related} />
            </div>
            <div className="mt-12">
              <NextStepBlocks assessmentHref={assessmentHref} />
            </div>
          </div>
        </div>
      </article>
    </EditorialPageShell>
  );
}
