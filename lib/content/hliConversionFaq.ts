/**
 * Conversion-focused FAQs for patients hesitating before starting (homepage, secure start).
 */

export type HliConversionFaqItem = {
  q: string;
  a: string;
};

export const HLI_CONVERSION_FAQ_ITEMS: readonly HliConversionFaqItem[] = [
  {
    q: "Is the initial analysis really free?",
    a: "Yes. You can start your initial hair analysis at no cost.",
  },
  {
    q: "Do I need blood tests before I begin?",
    a: "No. You can begin with symptoms, history, and any information you already have. Blood tests can be added later.",
  },
  {
    q: "Do I need scalp photos to start?",
    a: "No. Photos are helpful, but they are not required to begin.",
  },
  {
    q: "Do I need a referral?",
    a: "No referral is required.",
  },
  {
    q: "When do I pay?",
    a: "Only if you choose optional services: a blood request letter, a follow-up blood analysis review, membership, or the separate one-hour trichologist appointment. Your first clinical review pathway begins free.",
  },
  {
    q: "What does membership include?",
    a: "Membership is $10 per month and includes blood request letters, blood analysis reviews, ongoing support while your membership is active, and two 30-minute one-on-one Zoom consultations per calendar year — not per month, and not a lifetime allowance.",
  },
  {
    q: "What is the difference between membership Zoom sessions and the paid appointment?",
    a: "Membership includes two 30-minute one-on-one Zoom sessions per calendar year at no extra charge while you are subscribed. The optional trichologist appointment is different: a dedicated 1-hour session for $120 USD when you want extended time beyond those included visits.",
  },
  {
    q: "Do I need to book an appointment to get started?",
    a: "No. You can start with the free initial analysis first.",
  },
  {
    q: "Can HLI prescribe medication?",
    a: "HLI helps guide investigation, interpretation, and next steps, but prescriptions must be handled through the appropriate doctor or prescriber.",
  },
];
