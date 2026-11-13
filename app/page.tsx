import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Shield, HeartPulse, Leaf, User, Hospital, ClipboardList, ShieldCheck, Utensils, type LucideIcon } from 'lucide-react';
import { publicMetadata } from '@/components/public/seo';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import { heroArt } from '@/lib/art.js';
import { getActor, homeFor } from '@/lib/server/session';
import { publicCall } from '@/lib/server/data';
import { buttonVariants } from '@/components/ui/button';
import { Band, CtaBand } from '@/components/public/blocks';
import { MEDICAL_RULES, SAFETY_RULES, ACTIVE_DIET_CATEGORIES } from '@/domain/rules.js';

const HOME_TITLE = `${SITE_NAME}: Personalized Hospital Meals`;
const base = publicMetadata({ description: SITE_DESCRIPTION, path: '/' });
export const metadata: Metadata = { ...base, title: { absolute: HOME_TITLE }, openGraph: { ...base.openGraph, title: HOME_TITLE }, twitter: { ...base.twitter, title: HOME_TITLE } };

/** The core journey in three plain steps; the full version is on How It Works. */
const STEPS: [LucideIcon, string, string][] = [
  [ClipboardList, 'Record what each person needs', 'Diet order, allergies, tastes and appetite, entered by the care team and the patient.'],
  [ShieldCheck, 'Screen every meal, safety first', 'Conflicts are excluded and anything uncertain goes to an admin for review.'],
  [Utensils, 'Choose, eat, and learn', 'Patients pick from ranked, explained options; feedback shapes the next meal.'],
];

const AGENCIES: [string, string][] = [
  ['MOH', 'Ministry of Health'],
  ['SNDC', 'Saudi National Diabetes Center'],
  ['SFDA', 'Saudi Food & Drug Authority'],
  ['MEWA', 'Ministry of Environment, Water and Agriculture'],
  ['GFSA', 'General Food Security Authority'],
];

function AudienceCard({ icon: Icon, title, tone, action, children }: { icon: LucideIcon; title: string; tone: 'mint' | 'rose'; action: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-full ${tone === 'mint' ? 'bg-mint text-heading' : 'bg-rose text-rose-ink'}`}><Icon className="size-5" /></span>
        <h3 className="text-[1.2rem]">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
      {action}
    </div>
  );
}

export default async function Home() {
  const actor = await getActor();
  const start = actor ? homeFor(actor) : '/login';
  const startLabel = actor ? 'Go to my start page' : 'Try the demonstration hospital';
  const mealCount = await publicCall((s) => s.catalog().list.length as number);
  const hospital = actor?.role === 'member' ? null : { href: start, label: startLabel };
  const member = !actor ? { href: '/register', label: 'Create my account' } : actor.role === 'member' ? { href: start, label: 'Go to my meals' } : null;
  const counts = { meals: mealCount, diets: ACTIVE_DIET_CATEGORIES.length, rules: MEDICAL_RULES.length + SAFETY_RULES.length };

  return (
    <>
      <section className="overflow-hidden bg-[radial-gradient(1200px_500px_at_85%_10%,var(--cb-rose),transparent_60%),radial-gradient(900px_500px_at_0%_100%,var(--cb-mint),transparent_60%)] py-10 sm:py-16">
        <div className="container-page grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="flex flex-col gap-5">
            <span className="eyebrow">Personalized Hospital Meal Recommendation Platform</span>
            <h1 className="text-display">Care in <em className="not-italic text-rose-ink">every bite</em>.</h1>
            <p className="text-[1.15rem]">Hospital meals matched to each patient’s diet, allergies, tastes and appetite.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={start} className={buttonVariants({ size: 'lg' })}>{actor ? <ChevronRight aria-hidden /> : <Sparkles aria-hidden />}{startLabel}</Link>
              <Link href="/how-it-works" className={buttonVariants({ variant: 'outline', size: 'lg' })}>How It Works</Link>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[.9rem] text-muted-foreground">
              <li className="inline-flex items-center gap-1.5"><Shield className="size-4 text-heading" aria-hidden />Allergies and diet orders screened first</li>
              <li className="inline-flex items-center gap-1.5"><HeartPulse className="size-4 text-heading" aria-hidden />Admins decide; CareBite supports</li>
              <li className="inline-flex items-center gap-1.5"><Leaf className="size-4 text-heading" aria-hidden />SFDA and MEWA guidance</li>
            </ul>
          </div>
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[28px] bg-rose shadow-lift">
            <div className="h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>svg]:block [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: heroArt() }} />
            <p className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 rounded-[16px] bg-card/95 px-3.5 py-2.5 text-[.85rem] shadow-soft sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-[calc(100%-2rem)]">
              <Leaf className="size-6 shrink-0 text-heading" aria-hidden />
              <span><b>{counts.meals} menu items</b> screened against <b>{counts.diets} hospital diet categories</b> and <b>{counts.rules} documented rules</b></span>
            </p>
          </div>
        </div>
      </section>

      <Band tone="white" aria-labelledby="steps-h" className="py-10 sm:py-14 lg:py-16">
        <div className="container-page">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 id="steps-h" className="text-[1.5rem] leading-tight sm:text-[1.9rem]">How it works, in three steps</h2>
            <Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-1 font-semibold">How It Works <ChevronRight className="size-4" aria-hidden /></Link>
          </div>
          <ol aria-labelledby="steps-h" className="grid gap-3 md:grid-cols-3">
            {STEPS.map(([Icon, title, text], i) => (
              <li key={title} className="flex items-start gap-3.5 rounded-[18px] border border-border bg-background p-4 sm:p-5">
                <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-mint text-heading"><Icon className="size-5" /></span>
                <span className="min-w-0">
                  <b className="block font-display text-[1.05rem] font-medium text-heading"><span className="sr-only">Step {i + 1}: </span>{title}</b>
                  <span className="text-[.95rem] text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Band>

      <Band aria-labelledby="who-h" className="py-10 sm:py-14 lg:py-16">
        <div className="container-page">
          <h2 id="who-h" className="mb-6 text-[1.5rem] leading-tight sm:text-[1.9rem]">Who it’s for</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AudienceCard icon={Hospital} title="Hospital care" tone="mint"
              action={hospital ? <Link href={hospital.href} className={buttonVariants({ className: 'w-full sm:w-fit' })}>{actor ? <ChevronRight aria-hidden /> : <Sparkles aria-hidden />}{hospital.label}</Link> : null}>
              <p>Patients choose from approved meals, staff run the daily meal service, and admins set diet orders and review what needs a professional eye.</p>
              <p className="text-sm text-muted-foreground">A fictional demonstration hospital: every patient and record is made up.</p>
            </AudienceCard>
            <AudienceCard icon={User} title="Member" tone="rose"
              action={member ? <Link href={member.href} className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-fit' })}>{member.label} <ChevronRight aria-hidden /></Link> : null}>
              <p>For yourself, not in hospital: meals that fit you, a simple food diary for your day, and help to waste less.</p>
              <p className="text-sm text-muted-foreground">You keep your own food profile. Nothing is shared with a hospital.</p>
            </AudienceCard>
          </div>
        </div>
      </Band>

      <Band tone="blush" aria-labelledby="sa" className="py-8 sm:py-12 lg:py-14">
        <div className="container-page flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-2">
            <h2 id="sa" className="text-[1.35rem] leading-tight sm:text-[1.6rem]">Built on Saudi government guidance</h2>
            <p className="text-[.95rem] text-muted-foreground">Every food and health rule comes from a Saudi government source. Where none sets a number, the admin sets it.</p>
          </div>
          <ul aria-label="Saudi government sources" className="flex flex-wrap gap-2">
            {AGENCIES.map(([abbr, name]) => (
              <li key={abbr} className="inline-flex items-center gap-1.5 rounded-full border border-rose bg-card px-3 py-1.5 text-sm">
                <b className="font-display font-semibold text-heading">{abbr}</b><span className="sr-only">, </span><span className="text-muted-foreground">{name}</span>
              </li>
            ))}
          </ul>
          <Link href="/sources" className={buttonVariants({ variant: 'outline', className: 'w-full shrink-0 sm:w-fit' })}>All sources and limitations <ChevronRight aria-hidden /></Link>
        </div>
      </Band>

      <Band className="py-10 sm:py-14 lg:py-16">
        <div className="container-page">
          <CtaBand title="Explore the demonstration hospital"
            action={<Link href={start} className={buttonVariants({ size: 'lg' })}><Sparkles aria-hidden />{actor ? 'Go to my start page' : 'Choose a demo account'}</Link>}>
            <p>Log in as a patient, a staff member or an admin. Every patient and record is fictional.</p>
          </CtaBand>
        </div>
      </Band>
    </>
  );
}
