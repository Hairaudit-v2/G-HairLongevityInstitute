/**
 * Phase R: Longevity-only email delivery adapter for reminder emails.
 * Small provider abstraction; easy to swap (Resend, console stub, or none).
 * Do not use for non-longevity flows.
 * Uses HLI unified email layout when html is provided or built from bodyText.
 *
 * Sender domain: the `from` address must use a domain verified in Resend (or sends will fail).
 * Reply-To: defaults route patient replies to the Evolved Hair trichologist inbox until HLI has a dedicated inbound address.
 */

export type SendReminderEmailParams = {
  to: string;
  subject: string;
  /** Plain-text body (required). When html is not provided, adapter may wrap bodyText in HLI layout. */
  bodyText: string;
  /** Optional HTML body. When provided, Resend sends multipart (html + text). */
  html?: string;
  reminderId?: string;
  /**
   * Optional Reply-To header for this send only.
   * Overrides LONGEVITY_EMAIL_REPLY_TO and the default Evolved Hair address.
   */
  replyTo?: string;
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

const DEFAULT_FROM = "Hair Longevity Institute <noreply@hairlongevityinstitute.com>";
const DEFAULT_REPLY_TO = "trichologist@evolvedhair.com.au";

function getFromAddress(): string {
  return (
    process.env.LONGEVITY_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    DEFAULT_FROM
  );
}

/** Resend SDK (v4) uses camelCase `replyTo` on the send payload. */
function getReplyToAddress(params: Pick<SendReminderEmailParams, "replyTo">): string {
  const perSend = params.replyTo?.trim();
  if (perSend) return perSend;
  const fromEnv = process.env.LONGEVITY_EMAIL_REPLY_TO?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_REPLY_TO;
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
      replyTo: getReplyToAddress(params),
      bodyLength: params.bodyText?.length ?? 0,
    });
    return { ok: true, provider: "console" };
  },
};

/**
 * Resend adapter: sends via Resend API. Requires RESEND_API_KEY; optional LONGEVITY_EMAIL_FROM / RESEND_FROM / LONGEVITY_EMAIL_REPLY_TO.
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
        const replyTo = getReplyToAddress(params);
        const payload: Parameters<typeof resend.emails.send>[0] = {
          from,
          to: [params.to],
          subject: params.subject,
          text: params.bodyText,
          replyTo,
        };
        if (params.html) payload.html = params.html;
        const { data, error } = await resend.emails.send(payload);
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

/**
 * Send one reminder email using the configured adapter.
 * Appends HLI footer to body text and wraps in branded HTML when possible.
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
  const { getHliEmailFooterPlain, buildHliEmailHtmlFromPlainBody } = await import(
    "@/lib/email/hliEmailLayout"
  );
  const bodyText =
    (params.bodyText?.trim() ?? "") + getHliEmailFooterPlain();
  const html =
    params.html ??
    buildHliEmailHtmlFromPlainBody(params.bodyText?.trim() ?? "");
  return adapter.send({ ...params, bodyText, html });
}
