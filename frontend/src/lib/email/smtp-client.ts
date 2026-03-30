import net from 'node:net'
import tls from 'node:tls'

interface SmtpConfig {
  host: string
  port: number
  username: string
  password: string
  from: string
  secure: boolean
}

interface SendMailParams {
  to: string
  subject: string
  html: string
  text?: string
}

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const username = process.env.SMTP_USER
  const password = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!host || !username || !password || !from || !Number.isFinite(port)) return null

  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465
  return { host, port, username, password, from, secure }
}

function buildMessage({ from, to, subject, html, text }: SendMailParams & { from: string }) {
  const boundary = `boundary_${Math.random().toString(36).slice(2)}`
  const safeSubject = subject.replace(/\r?\n/g, ' ')
  const plainText = (text || '').replace(/\r?\n/g, '\r\n')

  return [
    `From: Silver Union Capital <${from}>`,
    `To: ${to}`,
    `Subject: ${safeSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    plainText,
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

export function getSupportUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  if (!base) return '/dashboard/support'
  return `${base.replace(/\/$/, '')}/dashboard/support`
}

async function sendCommand(socket: net.Socket | tls.TLSSocket, command?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let response = ''

    const cleanup = () => {
      socket.off('data', onData)
      socket.off('error', onError)
    }

    const onError = (error: Error) => {
      cleanup()
      reject(error)
    }

    const onData = (chunk: Buffer) => {
      response += chunk.toString('utf8')
      const lines = response.split('\r\n').filter(Boolean)
      if (!lines.length) return
      const lastLine = lines[lines.length - 1]
      if (/^\d{3} /.test(lastLine)) {
        cleanup()
        resolve(response)
      }
    }

    socket.on('error', onError)
    socket.on('data', onData)

    if (command) socket.write(`${command}\r\n`)
  })
}

function ensureOk(response: string, acceptedPrefix: string[]) {
  const code = response.slice(0, 3)
  if (!acceptedPrefix.includes(code)) {
    throw new Error(`SMTP command failed: ${response.trim()}`)
  }
}

async function negotiate(socket: net.Socket | tls.TLSSocket, config: SmtpConfig) {
  const greeting = await sendCommand(socket)
  ensureOk(greeting, ['220'])

  const ehlo = await sendCommand(socket, `EHLO ${config.host}`)
  ensureOk(ehlo, ['250'])

  if (!config.secure && ehlo.includes('STARTTLS')) {
    const starttls = await sendCommand(socket, 'STARTTLS')
    ensureOk(starttls, ['220'])

    const upgraded = tls.connect({ socket, servername: config.host })
    await new Promise<void>((resolve, reject) => {
      upgraded.once('secureConnect', () => resolve())
      upgraded.once('error', reject)
    })

    return upgraded
  }

  return socket
}

export async function sendMail(params: SendMailParams): Promise<void> {
  const config = readConfig()
  if (!config) {
    console.warn('SMTP is not configured. Skipping email delivery.')
    return
  }

  const initialSocket = config.secure
    ? tls.connect({ host: config.host, port: config.port, servername: config.host })
    : net.connect({ host: config.host, port: config.port })

  await new Promise<void>((resolve, reject) => {
    initialSocket.once('connect', () => resolve())
    initialSocket.once('error', reject)
  })

  let socket: net.Socket | tls.TLSSocket = await negotiate(initialSocket, config)

  const authLogin = await sendCommand(socket, 'AUTH LOGIN')
  ensureOk(authLogin, ['334'])

  const userRes = await sendCommand(socket, Buffer.from(config.username).toString('base64'))
  ensureOk(userRes, ['334'])

  const passRes = await sendCommand(socket, Buffer.from(config.password).toString('base64'))
  ensureOk(passRes, ['235'])

  const fromRes = await sendCommand(socket, `MAIL FROM:<${config.from}>`)
  ensureOk(fromRes, ['250'])

  const toRes = await sendCommand(socket, `RCPT TO:<${params.to}>`)
  ensureOk(toRes, ['250', '251'])

  const dataRes = await sendCommand(socket, 'DATA')
  ensureOk(dataRes, ['354'])

  const message = buildMessage({ ...params, from: config.from }).replace(/\n\.\n/g, '\n..\n')
  const bodyRes = await sendCommand(socket, `${message}\r\n.`)
  ensureOk(bodyRes, ['250'])

  await sendCommand(socket, 'QUIT')
  socket.end()
}
