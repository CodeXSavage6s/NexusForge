/**
 * Branded HTML email templates for NexusForge.
 *
 * The logo is referenced as `cid:logo` — meaning it must be sent as an
 * inline attachment with `cid: "logo"` (see mails.ts). This is the most
 * reliable way to show a logo in email, since most clients (Outlook,
 * older Gmail, etc.) block remote images by default or don't support SVG.
 */

const BRAND = {
  name: "NexusForge",
  darkBg: "#1e1b4b",
  indigo: "#6366f1",
  indigoDark: "#4338ca",
  cyan: "#22d3ee",
  textDark: "#1f2333",
  textMuted: "#6b7280",
  pageBg: "#f4f4f8",
  cardBg: "#ffffff",
  border: "#e5e7eb",
};

/** Wraps body content in the shared header/footer shell used by every email. */
function shell(title: string, bodyHtml: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.pageBg}; -webkit-text-size-adjust:100%; text-size-adjust:100%;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.pageBg};">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:${BRAND.cardBg}; border-radius:12px; overflow:hidden; box-shadow: 0 1px 4px rgba(16,17,42,0.08);">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="background-color:${BRAND.darkBg}; padding: 32px 24px;">
              <img src="cid:logo" alt="${BRAND.name}" width="220" style="display:block; width:220px; max-width:60%; height:auto; border:0;" />
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="height:4px; line-height:4px; font-size:0; background:linear-gradient(90deg, ${BRAND.indigo}, ${BRAND.cyan});">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:${BRAND.textDark};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; border-top:1px solid ${BRAND.border}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <p style="margin:0 0 8px 0; font-size:12px; line-height:18px; color:${BRAND.textMuted};">
                This email was sent by ${BRAND.name}. If you didn't expect this email, you can safely ignore it.
              </p>
              <p style="margin:0; font-size:12px; line-height:18px; color:${BRAND.textMuted};">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable branded CTA button (table-based for Outlook compatibility). */
function ctaButton(url: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
    <tr>
      <td align="center" style="border-radius:8px; background: ${BRAND.indigo};">
        <a href="${url}" target="_blank"
           style="display:inline-block; padding:14px 32px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Fallback plain-link block, in case the button doesn't render/click. */
function fallbackLink(url: string): string {
  return `
  <p style="margin: 0 0 4px 0; font-size:13px; color:${BRAND.textMuted};">
    Or copy and paste this link into your browser:
  </p>
  <p style="margin:0; font-size:13px; word-break:break-all;">
    <a href="${url}" target="_blank" style="color:${BRAND.indigo}; text-decoration:underline;">${url}</a>
  </p>`;
}

/* ------------------------------------------------------------------ */
/* 1. Verification email                                              */
/* ------------------------------------------------------------------ */

export function verificationEmailHtml({
  name,
  verificationUrl,
  expiresInMinutes = 30,
}: {
  name?: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}): string {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const body = `
    <h1 style="margin:0 0 16px 0; font-size:22px; line-height:28px; font-weight:700; color:${BRAND.textDark};">
      Verify your email address
    </h1>
    <p style="margin:0 0 8px 0; font-size:15px; line-height:24px; color:${BRAND.textDark};">
      ${greeting}
    </p>
    <p style="margin:0 0 8px 0; font-size:15px; line-height:24px; color:${BRAND.textDark};">
      Thanks for signing up for ${BRAND.name}! Please confirm this is your email address by clicking the button below.
    </p>
    ${ctaButton(verificationUrl, "Verify email address")}
    ${fallbackLink(verificationUrl)}
    <p style="margin: 24px 0 0 0; font-size:13px; line-height:20px; color:${BRAND.textMuted};">
      This link will expire in ${expiresInMinutes} minutes. If you didn't create an account with ${BRAND.name}, you can safely ignore this email.
    </p>
  `;
  return shell(
    "Verify your email address",
    body,
    `Confirm your email to finish setting up your ${BRAND.name} account.`
  );
}

/* ------------------------------------------------------------------ */
/* 2. Welcome email                                                    */
/* ------------------------------------------------------------------ */

export function welcomeEmailHtml({
  name,
  loginUrl,
}: {
  name?: string;
  loginUrl: string;
}): string {
  const greeting = name ? `Welcome, ${name}! 🎉` : "Welcome! 🎉";
  const body = `
    <h1 style="margin:0 0 16px 0; font-size:22px; line-height:28px; font-weight:700; color:${BRAND.textDark};">
      ${greeting}
    </h1>
    <p style="margin:0 0 8px 0; font-size:15px; line-height:24px; color:${BRAND.textDark};">
      Your email is verified and your ${BRAND.name} account is ready to go. We're glad to have you here.
    </p>
    <p style="margin:0 0 8px 0; font-size:15px; line-height:24px; color:${BRAND.textDark};">
      Here's a quick way to get started:
    </p>
    <ul style="margin:0 0 8px 0; padding-left:20px; font-size:15px; line-height:26px; color:${BRAND.textDark};">
      <li>Complete your profile</li>
      <li>Explore your dashboard</li>
      <li>Invite your team</li>
    </ul>
    ${ctaButton(loginUrl, "Go to your dashboard")}
    <p style="margin: 24px 0 0 0; font-size:13px; line-height:20px; color:${BRAND.textMuted};">
      Questions? Just reply to this email — we're happy to help.
    </p>
  `;
  return shell(
    `Welcome to ${BRAND.name}`,
    body,
    `Your ${BRAND.name} account is ready. Here's how to get started.`
  );
}

/* ------------------------------------------------------------------ */
/* 3. Password reset email                                             */
/* ------------------------------------------------------------------ */

export function passwordResetEmailHtml({
  name,
  resetUrl,
  expiresInMinutes = 30,
}: {
  name?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): string {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const body = `
    <h1 style="margin:0 0 16px 0; font-size:22px; line-height:28px; font-weight:700; color:${BRAND.textDark};">
      Reset your password
    </h1>
    <p style="margin:0 0 8px 0; font-size:15px; line-height:24px; color:${BRAND.textDark};">
      ${greeting}
    </p>
    <p style="margin:0 0 8px 0; font-size:15px; line-height:24px; color:${BRAND.textDark};">
      We received a request to reset the password for your ${BRAND.name} account. Click the button below to choose a new password.
    </p>
    ${ctaButton(resetUrl, "Reset password")}
    ${fallbackLink(resetUrl)}
    <p style="margin: 24px 0 0 0; font-size:13px; line-height:20px; color:${BRAND.textMuted};">
      This link will expire in ${expiresInMinutes} minutes. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
    </p>
  `;
  return shell(
    "Reset your password",
    body,
    `Reset the password for your ${BRAND.name} account.`
  );
}
