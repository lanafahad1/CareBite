'use client';
// A quiet reminder for people who have not confirmed their email yet (it is not required to use CareBite).
import * as React from 'react';
import { MailWarning, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { t } from '@/lib/text';

const KEY = 'carebite-verify-dismissed';

export function VerifyEmailBanner({ email }: { email: string }) {
  const [hidden, setHidden] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  React.useEffect(() => { try { setHidden(sessionStorage.getItem(KEY) === '1'); } catch { setHidden(false); } }, []);
  if (hidden) return null;
  const dismiss = () => { setHidden(true); try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ } };
  const resend = async () => {
    setPending(true);
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/email-verified' });
    setPending(false);
    toast(error ? (error.status === 429 ? t('Too many tries in a row. Wait a few minutes, then try again.') : t('We couldn’t send the email. Try again later.')) : t('Sent. Check your inbox (and spam folder).'), { tone: error ? 'error' : 'ok' });
  };
  return (
    <div role="status" className="border-b border-rose bg-blush print:hidden">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm text-rose-ink">
        <MailWarning aria-hidden className="size-4 shrink-0" />
        <span className="min-w-0 flex-1">{t('Please confirm your email so we can help if you forget your password.')}</span>
        <Button size="sm" variant="ghost" onClick={() => void resend()} disabled={pending}>{pending ? t('Sending…') : t('Send the email again')}</Button>
        <Button size="icon" variant="ghost" aria-label={t('Hide this reminder')} onClick={dismiss}><X aria-hidden /></Button>
      </div>
    </div>
  );
}
