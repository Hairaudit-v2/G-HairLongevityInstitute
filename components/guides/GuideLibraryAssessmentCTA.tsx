import { Container, PrimaryButton } from "@/components/public/PublicCTA";

type Props = {
  startHref: string;
  /** Unique id for the section heading (a11y) */
  headingId: string;
};

export function GuideLibraryAssessmentCTA({ startHref, headingId }: Props) {
  return (
    <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby={headingId}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id={headingId} className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
            Still unsure what is driving your hair changes?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
            A structured HLI assessment can help clarify whether you are dealing with pattern loss, shedding, hormonal
            influence, inflammatory scalp issues, or a mixed picture — and which evidence-based next steps may fit your
            biology. No referral required; clear interpretation, typically within 48 hours.
          </p>
          <div className="mt-8">
            <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
