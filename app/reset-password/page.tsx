import { pageMetadata } from '@/lib/seo';
import { t } from '@/lib/text';
import { PageHead, PageBody } from '@/components/site/page-head';
import { ResetPasswordForm } from '@/components/auth/password-reset';

export async function generateMetadata() {
  return pageMetadata({ title: t('Choose a new password'), description: t('Choose a new CareBite password.'), path: '/reset-password', noindex: true });
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ResetPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = first(sp.token) ?? null;
  return (
    <>
      <PageHead narrow eyebrow={t('Account')} title={t('Choose a new password')} />
      <PageBody narrow>
        <div className="max-w-md"><ResetPasswordForm token={token && /^[\w-]{8,200}$/.test(token) ? token : null} invalid={Boolean(first(sp.error))} /></div>
      </PageBody>
    </>
  );
}
