import nodemailer from 'nodemailer'

interface SendMailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export function getSupportUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  if (!base) return '/dashboard/support'
  return `${base.replace(/\/$/, '')}/dashboard/support`
}

export async function sendMail(params: SendMailParams): Promise<void> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!host || !user || !pass || !from) {
    console.warn('SMTP is not configured. Skipping email delivery.')
    return
  }

  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  })
}
