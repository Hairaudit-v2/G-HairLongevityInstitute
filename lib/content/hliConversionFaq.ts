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
    a: "Only if you choose optional support services such as a blood request letter, a follow-up blood analysis review, a one-on-one trichologist appointment, or membership.",
  },
  {
    q: "What does membership include?",
    a: "Membership is $10 per month and includes blood request letters, blood analysis reviews, and ongoing support.",
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
