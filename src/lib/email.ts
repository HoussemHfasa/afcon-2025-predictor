import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Lazy initialization of transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    console.log("Initializing SMTP transporter...");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_USER:", process.env.SMTP_USER ? "✓ set" : "✗ not set");
    console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "✓ set" : "✗ not set");
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `"AFCON 2025 Predictor" <${process.env.SMTP_FROM_EMAIL || "noreply@afcon2025.com"}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - AFCON 2025 Predictor</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
        <!-- Header -->
        <tr>
          <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f5c518 0%, #e6a700 100%);">
            <h1 style="margin: 0; color: #0a0a0a; font-size: 28px; font-weight: bold;">⚽ AFCON 2025 Predictor</h1>
          </td>
        </tr>
        
        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #ffffff; margin: 0 0 20px; font-size: 24px;">Welcome, ${username}! 🎉</h2>
            <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
              Thank you for joining AFCON 2025 Predictor! To start predicting match results and competing with other fans, please verify your email address.
            </p>
            
            <!-- Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align: center; padding: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f5c518 0%, #e6a700 100%); color: #0a0a0a; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 15px rgba(245, 197, 24, 0.3);">
                    Verify My Email
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #f5c518; font-size: 14px; word-break: break-all; margin: 10px 0 0;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
              This link will expire in 24 hours.
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding: 30px; background-color: #0f0f0f; text-align: center; border-top: 1px solid #262626;">
            <p style="color: #666666; font-size: 12px; margin: 0;">
              © 2025 AFCON 2025 Predictor. All rights reserved.
            </p>
            <p style="color: #666666; font-size: 12px; margin: 10px 0 0;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - AFCON 2025 Predictor ⚽",
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 16px; overflow: hidden; margin-top: 40px;">
        <tr>
          <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f5c518 0%, #e6a700 100%);">
            <h1 style="margin: 0; color: #0a0a0a; font-size: 28px; font-weight: bold;">⚽ AFCON 2025 Predictor</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #ffffff; margin: 0 0 20px;">Password Reset Request</h2>
            <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
              Hi ${username}, we received a request to reset your password. Click the button below to create a new password:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align: center; padding: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f5c518 0%, #e6a700 100%); color: #0a0a0a; text-decoration: none; font-weight: bold; border-radius: 12px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #666666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - AFCON 2025 Predictor",
    html,
  });
}

// Generate a secure random token
export function generateVerificationToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
