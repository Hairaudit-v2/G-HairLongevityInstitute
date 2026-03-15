/**
 * Phase R: Longevity-only email delivery adapter for reminder emails.
 * Small provider abstraction; easy to swap (Resend, console stub, or none).
 * Do not use for non-longevity flows.
 */

export type SendReminderEmailParams = {
  to: string;
  subject: string;
  bodyText: string;
  reminderId?: string;
};

export type SendReminderEmailResult =
  | { ok: true; provider: string }
  | { ok: false; error: string; provider: string };

export type LongevityEmailAdapter = {
  send(params: SendReminderEmailParams): Promise<SendReminderEmailResult>;
  readonly name: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidReminderEmail(value: string): boolean {
  const trimmed = value?.trim();
  return !!trimmed && EMAIL_REGEX.test(trimmed);
}

function getProvider(): "resend" | "console" | "none" {
  const v = process.env.LONGEVITY_EMAIL_PROVIDER?.toLowerCase().trim();
  if (v === "resend" || v === "console" || v === "none") return v;
  return "none";
}

function getFromAddress(): string {
  return (
    process.env.LONGEVITY_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "Hair Longevity Institute <onboarding@resend.dev>"
  );
}

/**
 * Console adapter: logs only, does not send. For local/dev.
 */
const consoleAdapter: LongevityEmailAdapter = {
  name: "console",
  async send(params: SendReminderEmailParams): Promise<SendReminderEmailResult> {
    // eslint-disable-next-line no-console
    console.info("[longevity-reminder-email]", {
      to: params.to,
      subject: params.subject,
      reminderId: params.reminderId,
      bodyLength: params.bodyText?.length ?? 0,
    });
    return { ok: true, provider: "console" };
  },
};

/**
 * Resend adapter: sends via Resend API. Requires RESEND_API_KEY and optional LONGEVITY_EMAIL_FROM.
 */
function createResendAdapter(): LongevityEmailAdapter | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    name: "resend",
    async send(params: SendReminderEmailParams): Promise<SendReminderEmailResult> {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);
        const from = getFromAddress();
        const { data, error } = await resend.emails.send({
          from,
          to: [params.to],
          subject: params.subject,
          text: params.bodyText,
        });
        if (error) {
          return { ok: false, error: error.message, provider: "resend" };
        }
        if (!data?.id) {
          return { ok: false, error: "No message id returned", provider: "resend" };
        }
        return { ok: true, provider: "resend" };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Resend send failed";
        return { ok: false, error: message, provider: "resend" };
      }
    },
  };
}

let _adapter: LongevityEmailAdapter | null | undefined;

/**
 * Returns the configured longevity reminder email adapter.
 * "none" or unset => null (caller should skip sending).
 * "console" => log-only. "resend" => Resend API when RESEND_API_KEY is set.
 */
export function getLongevityReminderEmailAdapter(): LongevityEmailAdapter | null {
  if (_adapter !== undefined) return _adapter;
  const provider = getProvider();
  if (provider === "none") {
    _adapter = null;
    return null;
  }
  if (provider === "console") {
    _adapter = consoleAdapter;
    return _adapter;
  }
  if (provider === "resend") {
    _adapter = createResendAdapter();
    return _adapter;
  }
  _adapter = null;
  return null;
}

const REMINDER_EMAIL_FOOTER =
  "\n\n—\nThis is an automated reminder from Hair Longevity Institute. If you have questions, please contact your clinician.";

/**
 * Send one reminder email using the configured adapter.
 * Appends a standard footer to body text. If no adapter is configured, returns ok: false.
 */
export async function sendLongevityReminderEmail(
  params: SendReminderEmailParams
): Promise<SendReminderEmailResult> {
  const adapter = getLongevityReminderEmailAdapter();
  if (!adapter) {
    return {
      ok: false,
      error: "Email delivery not configured (LONGEVITY_EMAIL_PROVIDER)",
      provider: "none",
    };
  }
  if (!isValidReminderEmail(params.to)) {
    return {
      ok: false,
      error: "Invalid or missing recipient email",
      provider: adapter.name,
    };
  }
  const bodyText =
    (params.bodyText?.trim() ?? "") + REMINDER_EMAIL_FOOTER;
  return adapter.send({ ...params, bodyText });
}
