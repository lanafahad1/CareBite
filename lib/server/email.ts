// Account emails (email confirmation and password reset), sent through Gmail SMTP
// with an app password. Configuration lives only in environment variables:
//   GMAIL_USER          the Gmail address that sends the emails
//   GMAIL_APP_PASSWORD  a 16-character Google app password (needs 2-step verification)
//   EMAIL_FROM_NAME     optional display name (default "CareBite")
// Without them, no email is sent: the app says the feature is unavailable, and in
// development the link is printed in the server log so it can still be tested.
import 'server-only';
import nodemailer from 'nodemailer';
import { SITE_NAME } from '@/lib/site';
import { EMAIL_LOGO_PNG_BASE64 } from './email-logo';

const LOGO_CID = 'logo@carebite';

export const emailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
const isDev = process.env.NODE_ENV !== 'production';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function transport() {
  transporter ??= nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: process.env.GMAIL_USER, pass: (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '') },
  });
  return transporter;
}

type Lang = 'en'; // the site is English only

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

type Mail = { heading: string; intro: string; button: string; note: string; subject: string };
const TEXT: Record<'verify' | 'reset', Record<Lang, (name: string, username: string) => Mail>> = {
  verify: {
    en: (name) => ({
      subject: 'Confirm your email for CareBite', heading: `Welcome to CareBite${name ? `, ${name}` : ''}`,
      intro: 'We’re glad you’re here. Confirm your email so we can help if you ever forget your password.',
      button: 'Confirm my email', note: 'This link works for 1 hour. Didn’t sign up for CareBite? You can ignore this email.',
    }),
  },
  reset: {
    en: (_n, username) => ({
      subject: 'Reset your CareBite password', heading: 'Reset your password',
      intro: `Someone asked to reset the password for @${username}. If it was you, choose a new one below.`,
      button: 'Choose a new password', note: 'This link works once, for 1 hour. Changing your password signs you out on your other devices. Didn’t ask for this? Ignore this email and your password stays the same.',
    }),
  },
};
const FOOT: Record<Lang, string> = {
  en: 'Care in every bite · A university Health Informatics project. You’re getting this because a CareBite account uses this address. CareBite will never ask for your password by email.',
};

/** Email HTML: one centred card, inline styles only (email clients ignore stylesheets), RTL for Arabic. */
export function renderEmail(kind: 'verify' | 'reset', lang: Lang, url: string, user: { name?: string; username?: string }) {
  const m = TEXT[kind][lang](user.name ?? '', user.username ?? '');
  const dir = 'ltr';
  const font = "Nunito, 'Segoe UI', Arial, sans-serif";
  const head = "Poppins, 'Segoe UI', Arial, sans-serif";
  const logo = `cid:${LOGO_CID}`;
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#EDE5E5;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFF9F7;border:1px solid #F6C9D2;border-radius:16px;overflow:hidden" dir="${dir}">
<tr><td style="background:#FFF1F4;padding:16px 24px;border-bottom:1px solid #FBE1E6"><img src="${logo}" width="40" height="40" alt="" style="vertical-align:middle;border:0"> <span dir="ltr" style="vertical-align:middle;font-family:${head};font-size:20px;font-weight:600;color:#3F5646">Care<span style="color:#7A3E50">Bite</span></span></td></tr>
<tr><td style="padding:24px;font-family:${font};font-size:15px;line-height:1.6;color:#515151;text-align:left">
<h1 style="margin:0 0 10px;font-family:${head};font-size:20px;color:#3F5646">${esc(m.heading)}</h1>
<p style="margin:0 0 18px">${esc(m.intro)}</p>
<p style="margin:0 0 18px"><a href="${esc(url)}" style="display:inline-block;background:#526B59;color:#FFFFFF;text-decoration:none;border-radius:999px;padding:12px 24px;font-family:${head};font-size:15px">${esc(m.button)}</a></p>
<p style="margin:0 0 14px;font-size:13px;color:#6B6666">${esc(m.note)}</p>
<p style="margin:0;font-size:12px;color:#6B6666">Button not working? Copy this link:<br><a href="${esc(url)}" dir="ltr" style="color:#526B59;word-break:break-all">${esc(url)}</a></p>
</td></tr>
<tr><td style="background:#FBE1E6;padding:14px 24px;font-family:${font};font-size:12px;line-height:1.5;color:#6B6666;text-align:left">${esc(FOOT[lang])}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${m.heading}\n\n${m.intro}\n\n${m.button}: ${url}\n\n${m.note}\n\n${FOOT[lang]}`;
  return { subject: m.subject, html, text };
}

/** Send an account email. Returns false when email is not configured (nothing is sent). */
export async function sendAccountEmail(kind: 'verify' | 'reset', to: string, url: string, user: { name?: string; username?: string }, request?: Request) {
  const lang: Lang = 'en';
  void request;
  const mail = renderEmail(kind, lang, url, user);
  if (!emailConfigured()) {
    if (isDev) console.info(`[email not configured] ${kind} email for ${to}: ${url}`);
    return false;
  }
  // Demo and test accounts use reserved, fictional domains (.test, .local, .example,
  // .invalid, example.com/org/net): never try to deliver to them.
  if (/(\.(test|local|example|invalid|localhost)|(^|\.)example\.(com|org|net))$/i.test(to.split('@')[1] ?? '')) return false;
  await transport().sendMail({ from: { name: process.env.EMAIL_FROM_NAME || SITE_NAME, address: process.env.GMAIL_USER as string }, to, subject: mail.subject, html: mail.html, text: mail.text,
    attachments: [{ filename: 'carebite.png', content: Buffer.from(EMAIL_LOGO_PNG_BASE64, 'base64'), cid: LOGO_CID, contentType: 'image/png' }] });
  return true;
}
