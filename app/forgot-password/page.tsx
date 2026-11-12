import { pageMetadata } from '@/lib/seo';
import { t } from '@/lib/text';
import { emailConfigured } from '@/lib/server/email';
import { PageHead, PageBody } from '@/components/site/page-head';
import { ForgotPasswordForm } from '@/components/auth/password-reset';

export async function generateMetadata() {
  return pageMetadata({ title: t('Forgot your password?'), description: t('Get a link by email to choose a new CareBite password.'), path: '/forgot-password', noindex: true });
}

export default async function ForgotPasswordPage() {
  return (
    <>
      <PageHead narrow eyebrow={t('Account')} title={t('Forgot your password?')}>
        <p>{t('Enter the email of your account and we’ll send you a link to choose a new password.')}</p>
      </PageHead>
      <PageBody narrow>
        <div className="max-w-md"><ForgotPasswordForm enabled={emailConfigured()} dev={process.env.NODE_ENV !== 'production'} /></div>
      </PageBody>
    </>
  );
}
