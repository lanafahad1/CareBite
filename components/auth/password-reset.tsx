'use client';
// "Forgot password?" (ask for a link by email) and "Choose a new password" (from the link).
import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, MailCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { PASSWORD_RULE, passwordProblem } from '@/lib/password-policy';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { buttonVariants } from '@/components/ui/button';
import { SuccessCheck } from '@/components/ui/success-check';
import { t } from '@/lib/text';
import { ShowPassword, FormError, SubmitButton, focusFirstInvalid } from './form-bits';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm({ enabled, dev }: { enabled: boolean; dev: boolean }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  if (!enabled && !dev) {
    return (
      <Notice tone="info" title={t('Password reset by email is not set up on this site yet.')}>
        {t('Ask the site owner to connect the email service. Demo accounts use a shared password shown on the log-in page.')}
      </Notice>
    );
  }
  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-[18px] border border-sage bg-mint p-5">
        <MailCheck aria-hidden className="size-7 text-sage-deep" />
        <h2 className="text-xl">{t('Check your email')}</h2>
        <p className="text-sage-deep">{t('If an account uses {email}, we sent a link to choose a new password. It works for 1 hour. Check your spam folder too.', { email })}</p>
        {!enabled ? <p className="text-sm text-muted-foreground">{t('Development mode: no email service is set up, so the link is printed in the server log instead.')}</p> : null}
        <Link href="/login" className={buttonVariants({ variant: 'outline' })}>{t('Back to log in')}</Link>
      </div>
    );
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    const v = email.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) { setError(t('Enter the email address of your account.')); focusFirstInvalid(formRef.current); return; }
    setError(null);
    setPending(true);
    const { error: err } = await authClient.requestPasswordReset({ email: v, redirectTo: '/reset-password' });
    setPending(false);
    // The answer never says whether an account exists (no account enumeration).
    if (err && err.status === 429) { setFormError(t('Too many tries in a row. Wait a few minutes, then try again.')); return; }
    setSent(true);
  };
  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4" aria-busy={pending || undefined}>
      <Field id="forgot-email" label={t('Email')} error={error} hint={t('Use the email on your account. Usernames won’t work here.')}>
        <Input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <FormError message={formError} />
      <SubmitButton pending={pending} pendingLabel={t('Sending…')} size="lg" className="w-full">{t('Send the link')}</SubmitButton>
      <Link href="/login" className="self-center text-sm">{t('Back to log in')}</Link>
    </form>
  );
}

export function ResetPasswordForm({ token, invalid }: { token: string | null; invalid: boolean }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [errors, setErrors] = React.useState<{ pw?: string; pw2?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  if (invalid || !token) {
    return (
      <Notice tone="warn" title={t('This link has expired or was already used.')}>
        <p>{t('Each link works once, for 1 hour. You can ask for a new one.')}</p>
        <Link href="/forgot-password" className={buttonVariants({ size: 'sm', className: 'mt-3' })}>{t('Ask for a new link')}</Link>
      </Notice>
    );
  }
  if (done) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-[18px] border border-sage bg-mint p-5">
        <SuccessCheck />
        <h2 className="text-xl">{t('Your password was changed')}</h2>
        <p className="text-sage-deep">{t('We’ve signed you out on your other devices. Log in with your new password.')}</p>
        <Link href="/login" className={buttonVariants()}>{t('Log in')}<ArrowRight aria-hidden /></Link>
      </div>
    );
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    const errs: typeof errors = {};
    const p = passwordProblem(pw);
    if (p) errs.pw = t(p);
    if (pw2 !== pw) errs.pw2 = t('The two passwords do not match.');
    setErrors(errs);
    if (Object.keys(errs).length) { focusFirstInvalid(formRef.current); return; }
    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword: pw, token });
    setPending(false);
    if (error) {
      const fieldErr = (error as { errors?: Record<string, string> }).errors?.newPassword;
      if (fieldErr) setErrors({ pw: t(fieldErr) });
      else setFormError(error.status === 429 ? t('Too many tries in a row. Wait a few minutes, then try again.') : t('This link has expired or was already used.'));
      return;
    }
    setDone(true);
  };
  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4" aria-busy={pending || undefined}>
      <Field id="reset-pw" label={t('New password')} error={errors.pw} hint={t(PASSWORD_RULE)}>
        <Input name="newPassword" type={show ? 'text' : 'password'} autoComplete="new-password" maxLength={128} value={pw} onChange={(e) => setPw(e.target.value)} required />
      </Field>
      <Field id="reset-pw2" label={t('Confirm new password')} error={errors.pw2}>
        <Input name="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" maxLength={128} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
      </Field>
      <ShowPassword id="reset-show" checked={show} onChange={setShow} />
      <FormError message={formError} />
      <SubmitButton pending={pending} pendingLabel={t('Saving…')} size="lg" className="w-full">{t('Save new password')}</SubmitButton>
    </form>
  );
}
