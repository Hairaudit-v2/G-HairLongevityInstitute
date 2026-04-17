export default function MedicalDisclaimer({ compact }: { compact?: boolean }) {
  return (
    <aside
      className={`rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(245,240,235,0.9)_0%,rgba(255,255,255,0.96)_100%)] shadow-soft ${compact ? "p-4" : "p-6"}`}
      role="note"
    >
      <p className={`font-semibold text-[rgb(var(--text-primary))] ${compact ? "text-sm" : ""}`}>
        Medical disclaimer
      </p>
      <p
        className={`mt-2 text-[rgb(var(--text-secondary))] leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
      >
        This material is for general education and does not constitute medical advice, diagnosis, or treatment.
        Individual results vary. Always discuss symptoms, tests, and treatment options with a qualified clinician.
      </p>
    </aside>
  );
}
