/**
 * HLI unified email layout: branded header, body, footer.
 * Premium, clinical, minimal. Aligns with GP letter and PDF styling.
 * Use for all transactional, reminder, and notification emails.
 */

import { HLI_BRAND, HLI_COLORS } from "@/lib/hliBranding";
import type { EmailBodyContent, EmailCTA, EmailSection } from "./types";

const MAX_WIDTH = 600;
const BODY_FONT_SIZE = "16px";
const BODY_LINE_HEIGHT = "1.6";
const BODY_COLOR = HLI_COLORS.primary;
const MUTED_COLOR = HLI_COLORS.muted;
const ACCENT_COLOR = HLI_COLORS.accent;
const BORDER_COLOR = HLI_COLORS.border;
const SECTION_BACKGROUND = HLI_COLORS.backgroundSubtle;
const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Render branded header HTML */
function renderHeader(content?: EmailBodyContent): string {
  const header = content?.header;
  const title = header?.title?.trim() || HLI_BRAND.businessName;
  const eyebrow = header?.eyebrow?.trim();
  const logoUrl = header?.logoUrl?.trim();
  const logoAlt = header?.logoAlt?.trim() || HLI_BRAND.businessName;
  const logo = logoUrl
    ? `
        <tr>
          <td style="padding-bottom:12px;">
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(logoAlt)}" width="180" style="display:block;max-width:180px;width:100%;height:auto;border:0;outline:none;text-decoration:none;">
          </td>
        </tr>`
    : "";
  const eyebrowRow = eyebrow
    ? `
        <tr>
          <td style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${ACCENT_COLOR};padding-bottom:6px;font-family:${FONT_FAMILY};">
            ${escapeHtml(eyebrow)}
          </td>
        </tr>`
    : "";
  const tagline = HLI_BRAND.tagline
    ? `\n        <tr><td style="font-size:13px;color:${MUTED_COLOR};padding-top:4px;font-family:${FONT_FAMILY};">${escapeHtml(HLI_BRAND.tagline)}</td></tr>`
    : "";
  return `
  <tr>
    <td style="padding:28px 28px 18px;border-bottom:1px solid ${BORDER_COLOR};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${logo}
        ${eyebrowRow}
        <tr>
          <td>
            <span style="font-size:26px;font-weight:600;color:${BODY_COLOR};font-family:${FONT_FAMILY};letter-spacing:0.2px;">${escapeHtml(title)}</span>
          </td>
        </tr>${tagline}
      </table>
    </td>
  </tr>`;
}

/** Render footer with contact details */
function renderFooter(): string {
  const parts: string[] = [HLI_BRAND.businessName];
  if (HLI_BRAND.website) parts.push(HLI_BRAND.website);
  if (HLI_BRAND.email) parts.push(HLI_BRAND.email);
  if (HLI_BRAND.phone) parts.push(HLI_BRAND.phone);
  const line = parts.join(" &middot; ");
  const address = HLI_BRAND.address
    ? `<tr><td style="font-size:12px;color:${MUTED_COLOR};padding-top:4px;">${escapeHtml(HLI_BRAND.address)}</td></tr>`
    : "";
  return `
  <tr>
    <td style="padding:20px 24px 24px;border-top:1px solid ${BORDER_COLOR};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:12px;color:${MUTED_COLOR};line-height:1.5;">${escapeHtml(line)}</td></tr>${address}
      </table>
    </td>
  </tr>`;
}

function renderParagraph(text: string): string {
  return `<p style="margin:0 0 12px;font-size:${BODY_FONT_SIZE};line-height:${BODY_LINE_HEIGHT};color:${BODY_COLOR};font-family:${FONT_FAMILY};">${escapeHtml(text)}</p>`;
}

function renderSection(section: EmailSection): string {
  const parts: string[] = [];
  if (section.heading) {
    parts.push(
      `<p style="margin:0 0 12px;font-size:12px;font-weight:600;letter-spacing:1.3px;text-transform:uppercase;color:${ACCENT_COLOR};font-family:${FONT_FAMILY};">${escapeHtml(section.heading)}</p>`
    );
  }
  if (section.paragraphs?.length) {
    for (const p of section.paragraphs) {
      parts.push(renderParagraph(p));
    }
  }
  if (section.bullets?.length) {
    parts.push(
      `<ul style="margin:0 0 12px;padding-left:20px;font-size:${BODY_FONT_SIZE};line-height:${BODY_LINE_HEIGHT};color:${BODY_COLOR};font-family:${FONT_FAMILY};">`
    );
    for (const b of section.bullets) {
      parts.push(`<li style="margin-bottom:6px;">${escapeHtml(b)}</li>`);
    }
    parts.push("</ul>");
  }
  if (parts.length === 0) return "";
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;border:1px solid ${BORDER_COLOR};border-radius:10px;background:${SECTION_BACKGROUND};">
    <tr>
      <td style="padding:18px 18px 6px;">
        ${parts.join("")}
      </td>
    </tr>
  </table>`;
}

function renderCta(cta: EmailCTA): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr><td>
      <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:11px 20px;font-size:14px;font-weight:500;color:${BODY_COLOR};background:${SECTION_BACKGROUND};border:1px solid ${BORDER_COLOR};text-decoration:none;font-family:${FONT_FAMILY};border-radius:6px;">${escapeHtml(cta.text)}</a>
    </td></tr>
  </table>`;
}

/** Build body HTML from structured content */
function renderBodyContent(content: EmailBodyContent): string {
  const parts: string[] = [];
  parts.push('<td style="padding:28px 28px 24px;">');

  if (content.greeting) {
    parts.push(
      `<p style="margin:0 0 16px;font-size:${BODY_FONT_SIZE};line-height:${BODY_LINE_HEIGHT};color:${BODY_COLOR};font-family:${FONT_FAMILY};">${escapeHtml(content.greeting)}</p>`
    );
  }

  if (content.introParagraphs?.length) {
    for (const p of content.introParagraphs) {
      parts.push(renderParagraph(p));
    }
  }

  if (content.sections?.length) {
    for (const section of content.sections) {
      parts.push(renderSection(section));
    }
  }

  if (content.cta) {
    parts.push(renderCta(content.cta));
  }

  if (content.closingParagraphs?.length) {
    for (const p of content.closingParagraphs) {
      parts.push(renderParagraph(p));
    }
  }

  if (content.signOff) {
    parts.push(
      `<p style="margin:20px 0 0;font-size:${BODY_FONT_SIZE};line-height:${BODY_LINE_HEIGHT};color:${BODY_COLOR};font-family:${FONT_FAMILY};">${escapeHtml(content.signOff)}</p>`
    );
  }

  parts.push("</td>");
  return parts.join("");
}

/**
 * Build full HTML email from structured content.
 * Mobile-friendly: single column, max-width, readable font size.
 */
export function buildHliEmailHtml(content: EmailBodyContent): string {
  const bodyRow = `<tr>${renderBodyContent(content)}</tr>`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:24px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${MAX_WIDTH}px;background:${HLI_COLORS.background};border-radius:8px;overflow:hidden;">
${renderHeader(content)}
${bodyRow}
${renderFooter()}
</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Build plain-text version of the same content (for multipart emails).
 */
export function buildHliEmailText(content: EmailBodyContent): string {
  const lines: string[] = [];

  if (content.greeting) lines.push(content.greeting, "");
  if (content.introParagraphs?.length) {
    for (const p of content.introParagraphs) {
      lines.push(p, "");
    }
  }
  if (content.sections?.length) {
    for (const s of content.sections) {
      if (s.heading) lines.push(s.heading, "");
      if (s.paragraphs) for (const p of s.paragraphs) lines.push(p, "");
      if (s.bullets) for (const b of s.bullets) lines.push(`• ${b}`);
      lines.push("");
    }
  }
  if (content.cta) {
    lines.push(`${content.cta.text}: ${content.cta.url}`, "");
  }
  if (content.closingParagraphs?.length) {
    for (const p of content.closingParagraphs) lines.push(p, "");
  }
  if (content.signOff) lines.push("", content.signOff);

  const body = lines.join("\n").trim();
  const footerParts = [
    HLI_BRAND.businessName,
    HLI_BRAND.website,
    HLI_BRAND.email,
    HLI_BRAND.phone,
  ].filter(Boolean);
  const footer = footerParts.join(" · ");
  return `${body}\n\n—\n${footer}`;
}

const DEFAULT_SIGN_OFF = "Hair Longevity Institute™";

/**
 * Wrap plain body text (e.g. reminder body_text) in the full layout.
 * Use when you have pre-composed plain text and want consistent header/footer.
 */
export function buildHliEmailHtmlFromPlainBody(
  plainBody: string,
  signOff: string = DEFAULT_SIGN_OFF
): string {
  const paragraphs = plainBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const content: EmailBodyContent = {
    introParagraphs: paragraphs.length ? paragraphs : [plainBody],
    signOff,
  };
  return buildHliEmailHtml(content);
}

/**
 * Default footer line for plain-text append (when not using full structured content).
 */
export function getHliEmailFooterPlain(): string {
  const parts = [HLI_BRAND.businessName];
  if (HLI_BRAND.website) parts.push(HLI_BRAND.website);
  if (HLI_BRAND.email) parts.push(HLI_BRAND.email);
  if (HLI_BRAND.phone) parts.push(HLI_BRAND.phone);
  return `\n\n—\n${parts.join(" · ")}`;
}
