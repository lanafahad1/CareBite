import Link from 'next/link';
import { publicMetadata } from '@/components/public/seo';
import { DEVELOPER, CONTACT_EMAIL, SITE_URL } from '@/lib/site';
import { AboutNav } from '@/components/cb/misc';
import { PageHead } from '@/components/site/page-head';
import { Notice } from '@/components/ui/notice';
import { JsonLd } from '@/components/public/json-ld';

const DESCRIPTION = 'CareBite was developed as a university Health Informatics project. Email the CareBite team with questions, feedback or bugs. CareBite is not a medical service.';
export const metadata = publicMetadata({ title: 'Contact', description: DESCRIPTION, path: '/contact' });

export default function ContactPage() {
  const ld = { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact CareBite', url: `${SITE_URL}/contact`, description: DESCRIPTION, about: { '@id': `${SITE_URL}/#project` } };
  return (
    <>
      <JsonLd data={ld} />
      <AboutNav current="/contact" />
      <PageHead eyebrow="Contact" title="Get in touch" narrow>
        <p>CareBite was developed as a university Health Informatics project by:</p>
      </PageHead>
      <div className="container-page container-narrow pb-16">
        <div className="prose-cb">
          <ul className="!list-none !pl-0 grid gap-2 sm:grid-cols-2">
            <li className="rounded-[14px] border border-border bg-card px-4 py-3 font-display font-medium text-heading">{DEVELOPER.en} · <span lang="ar" dir="rtl">{DEVELOPER.ar}</span></li>
          </ul>
          <h2>Email</h2>
          <p><a href={`mailto:${CONTACT_EMAIL}`} className="font-display font-medium">{CONTACT_EMAIL}</a></p>
          <p>For questions about the project, feedback or bugs. Please don’t send health information: email is not a secure channel for medical details.</p>
          <Notice title="Not a medical service">CareBite cannot provide medical or dietary advice. For health questions, contact a qualified healthcare professional. In an emergency, alert clinical staff or emergency services.</Notice>
          <p className="text-sm text-muted-foreground">Looking for the citation? It is on <Link href="/sources">Data sources &amp; limitations</Link>.</p>
        </div>
      </div>
    </>
  );
}
