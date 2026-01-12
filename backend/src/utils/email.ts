import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : null

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!transporter) {
    console.warn('[EMAIL] SMTP not configured. Email not sent:', options.subject)
    console.info('[EMAIL] Would send to:', options.to)
    return
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html
  })
}

export async function sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Recuperação de Senha - Photo Album',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #3b82f6; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Recuperação de Senha</h1>
            <p>Olá, ${name}!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
            <p>Se você não solicitou esta alteração, ignore este email.</p>
            <p>Este link expira em 1 hora.</p>
            <div class="footer">
              <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
              <p>${resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}
