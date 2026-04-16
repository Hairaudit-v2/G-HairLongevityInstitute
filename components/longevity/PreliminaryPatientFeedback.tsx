import type { PreliminaryPatientFeedback } from "@/lib/longevity/intake/preliminaryPatientFeedback";

type Props = {
  feedback: PreliminaryPatientFeedback;
};

export function PreliminaryPatientFeedback({ feedback }: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-[rgb(198,167,94)]/25 bg-[rgb(198,167,94)]/8 p-5 md:p-6">
      <div className="text-sm tracking-widest text-[rgb(198,167,94)]">
        Based on the information provided so far
      </div>
      <h3 className="mt-2 text-xl font-semibold text-white">{feedback.headline}</h3>
      <p className="mt-3 text-sm leading-6 text-white/80">{feedback.summary}</p>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-white/90">
          Initial areas we may need to investigate
        </h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {feedback.cards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-white/10 bg-[rgb(15,27,45)]/55 p-4"
            >
              <h5 className="text-sm font-semibold text-white">{card.title}</h5>
              <p className="mt-2 text-sm leading-6 text-white/75">{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[rgb(15,27,45)]/45 p-4">
        <h4 className="text-sm font-semibold text-white/90">What happens next</h4>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/75">
          {feedback.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs leading-5 text-white/60">{feedback.disclaimer}</p>
    </div>
  );
}
