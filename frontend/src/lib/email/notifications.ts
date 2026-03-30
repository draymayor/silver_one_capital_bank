import { sendMail, getSupportUrl } from '@/lib/email/smtp-client'
import {
  supportReplyNotificationEmail,
  withdrawalCompletedEmail,
  withdrawalRequestSubmittedEmail,
} from '@/lib/email/templates'

export async function sendWithdrawalSubmittedEmail(params: { fullName: string; email: string; amount: string }) {
  const payload = withdrawalRequestSubmittedEmail(params.fullName, params.amount)
  await sendMail({ to: params.email, subject: payload.subject, html: payload.html, text: payload.text })
}

export async function sendWithdrawalCompletedEmail(params: { fullName: string; email: string; amount: string }) {
  const payload = withdrawalCompletedEmail(params.fullName, params.amount)
  await sendMail({ to: params.email, subject: payload.subject, html: payload.html, text: payload.text })
}

export async function sendSupportReplyNotification(params: {
  fullName: string
  email: string
  supportMessage: string
  customerMessage?: string | null
}) {
  const payload = supportReplyNotificationEmail({
    fullName: params.fullName,
    supportMessage: params.supportMessage,
    customerMessage: params.customerMessage,
    supportUrl: getSupportUrl(),
  })

  await sendMail({ to: params.email, subject: payload.subject, html: payload.html, text: payload.text })
}
