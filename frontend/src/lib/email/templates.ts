const BRAND_NAVY = '#0B2447'

interface BrandedEmailArgs {
  heading: string
  introHtml: string
  bodyHtml: string
  closingHtml?: string
  cta?: {
    label: string
    url: string
  }
}

interface BaseEmailContent {
  subject: string
  html: string
  text: string
}

function brandedEmailWrapper({ heading, introHtml, bodyHtml, closingHtml, cta }: BrandedEmailArgs): string {
  const ctaHtml = cta
    ? `<div style="margin-top:24px;text-align:center;"><a href="${cta.url}" style="background:${BRAND_NAVY};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;padding:12px 18px;border-radius:8px;">${cta.label}</a></div>`
    : ''

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:20px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-collapse:collapse;overflow:hidden;border-radius:12px;">
            <tr>
              <td style="background:${BRAND_NAVY};padding:22px 24px;text-align:center;color:#ffffff;">
                <p style="margin:0;font-size:22px;font-weight:700;line-height:1.2;">Silver Union Capital</p>
                <p style="margin:6px 0 0 0;font-size:13px;letter-spacing:0.3px;">Customer Notification</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;">
                <h1 style="margin:0 0 14px 0;font-size:22px;line-height:1.3;color:#111827;">${heading}</h1>
                <div style="font-size:15px;line-height:1.7;color:#374151;">${introHtml}${bodyHtml}</div>
                ${ctaHtml}
                <div style="font-size:15px;line-height:1.7;color:#374151;margin-top:20px;">${closingHtml ?? ''}</div>
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND_NAVY};padding:16px 24px;text-align:center;color:#ffffff;font-size:12px;">
                © 2026 Silver Union Capital. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function withdrawalRequestSubmittedEmail(fullName: string, amount: string): BaseEmailContent {
  return {
    subject: 'Withdrawal Request Received',
    html: brandedEmailWrapper({
      heading: `Hello ${fullName}`,
      introHtml: `<p style="margin:0 0 12px 0;">Your withdrawal request of ${amount} has been submitted successfully.</p>`,
      bodyHtml: `<p style="margin:0 0 12px 0;">Additional verification is required before your request can be completed.</p><p style="margin:0;">Contact customer support for the next steps.</p>`,
      closingHtml: '<p style="margin:0;">Thanks,<br/>Silver Union Capital</p>',
    }),
    text: `Hello ${fullName}\n\nYour withdrawal request of ${amount} has been submitted successfully.\n\nAdditional verification is required before your request can be completed.\n\nContact customer support for the next steps.\n\nThanks,\nSilver Union Capital`,
  }
}

export function withdrawalCompletedEmail(fullName: string, amount: string): BaseEmailContent {
  return {
    subject: 'Withdrawal Completed Successfully',
    html: brandedEmailWrapper({
      heading: `Hello ${fullName}`,
      introHtml: `<p style="margin:0 0 12px 0;">This is to inform you that your withdrawal request of ${amount} has been completed successfully.</p>`,
      bodyHtml: '<p style="margin:0;">You can sign in to your dashboard for more details regarding this transaction.</p>',
      closingHtml: '<p style="margin:0;">Thanks,<br/>Silver Union Capital</p>',
    }),
    text: `Hello ${fullName}\n\nThis is to inform you that your withdrawal request of ${amount} has been completed successfully.\n\nYou can sign in to your dashboard for more details regarding this transaction.\n\nThanks,\nSilver Union Capital`,
  }
}

interface SupportReplyParams {
  fullName: string
  supportMessage: string
  supportUrl: string
  customerMessage?: string | null
}

export function supportReplyNotificationEmail({ fullName, supportMessage, supportUrl, customerMessage }: SupportReplyParams): BaseEmailContent {
  const conversationSummary = customerMessage
    ? `<div style="margin-top:16px;border:1px solid #d1d5db;background:#f9fafb;padding:12px;border-radius:8px;"><p style="margin:0 0 8px 0;"><strong>You:</strong> ${customerMessage}</p><p style="margin:0;"><strong>Support:</strong> ${supportMessage}</p></div>`
    : ''

  return {
    subject: 'New Support Message from Silver Union Capital',
    html: brandedEmailWrapper({
      heading: `Hello ${fullName}`,
      introHtml: '<p style="margin:0 0 12px 0;">You have received a new message from Silver Union Capital support.</p>',
      bodyHtml: `<p style="margin:0;"><strong>Latest reply:</strong><br/>${supportMessage}</p>${conversationSummary}`,
      cta: {
        label: 'Open Support Messages',
        url: supportUrl,
      },
      closingHtml: '<p style="margin:0;">Thanks,<br/>Silver Union Capital</p>',
    }),
    text: `Hello ${fullName}\n\nYou have received a new message from Silver Union Capital support.\n\nLatest reply:\n${supportMessage}\n${customerMessage ? `\nYou: ${customerMessage}\nSupport: ${supportMessage}\n` : ''}\nOpen Support Messages: ${supportUrl}\n\nThanks,\nSilver Union Capital`,
  }
}
