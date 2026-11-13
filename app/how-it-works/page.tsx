import Link from 'next/link';
import { Shield, TriangleAlert, ShieldX, Layers, RefreshCw, Activity, Users, List, Lock, BookOpen, type LucideIcon } from 'lucide-react';
import { publicMetadata } from '@/components/public/seo';
import { PageHead } from '@/components/site/page-head';
import { buttonVariants } from '@/components/ui/button';
import { CheckList, CheckItem, Pipeline, CtaBand, JOURNEY } from '@/components/public/blocks';
import { FoldOut } from '@/components/public/fold-out';
import { JsonLd } from '@/components/public/json-ld';
import { MEAL_SHARE } from '@/domain/rules.js';
import { PORTIONS } from '@/domain/constants.js';
import { SITE_URL } from '@/lib/site';

const DESCRIPTION = 'How CareBite screens every hospital meal against the diet order and allergies first, then ranks suitable options by preferences and appetite, with a transparent “Why This Meal?” explanation.';
export const metadata = publicMetadata({ title: 'How It Works', description: DESCRIPTION, path: '/how-it-works' });

const WORKFLOW = ['Options offered', 'Patient choice submitted', 'Confirmed by nutrition team', 'Prepared', 'Delivered'];
const share = (p: 'breakfast' | 'lunch' | 'dinner' | 'snack') => `${Math.round(MEAL_SHARE[p] * 100)}%`;

export default function HowItWorks() {
  const steps = [
    { safety: true, title: 'Diet order, allergies and restrictions', text: 'Nothing by mouth (NPO), confirmed allergen groups (SFDA’s 14) including cross-contact, specific ingredients, intolerances, no added sugar for diabetes (MOH), vegetarian, vegan, gluten-free and lactose-free diets, and medically excluded ingredients.' },
    { safety: true, title: 'Information that needs review', text: 'Allergies not yet assessed, allergies recorded as text that cannot be coded, texture-modified diets (no IDDSI level is recorded for menu items), renal diets without potassium and phosphorus limits, and missing nutrient data.' },
    { safety: true, title: 'Nutrient limits, per portion', text: `Sodium (2,000 mg a day by default, MOH and SFDA), carbohydrate (set by the admin), potassium and phosphorus (set by the admin) are checked for each permitted portion using SFDA Saudi Food Composition Table dish values. Without those values the meal goes to admin review. Daily limits are shared across the day: breakfast ${share('breakfast')}, lunch ${share('lunch')}, dinner ${share('dinner')}, snack ${share('snack')}.` },
    { title: 'Ranking', text: 'Preferred cuisine and foods, disliked ingredients, lower salt (MOH and SFDA), meals high in fibre by SFDA’s definition for diabetes, protein for high-protein diets, and recorded feedback on past meals.' },
    { title: 'Portion suggestion', text: 'The preferred portion, reduced when appetite is low or recent feedback says portions were too large, and only among portions that are permitted and pass every limit.' },
    { title: 'Explanation and kitchen instructions', text: '“Why This Meal?” for the team and the patient, and preparation instructions for the kitchen: allergy alerts, no added salt, no added sugar, small amounts of fat for cardiac diets, halal meat and poultry (SFDA Saudi Halal Center), texture level and label checks.' },
  ];
  const DETAILS: [LucideIcon, string, string, string, string][] = [
    [Layers, 'portions', 'Portions', 'Each portion size is screened on its own.', `${PORTIONS.map((p: { label: string; short: string }) => `${p.label} = ${p.short} serving`).join(', ')}. Each is screened separately, so a large portion can fail a sodium limit while a small one passes.`],
    [RefreshCw, 'changes', 'Changes after an order', 'Upcoming meals are screened again, and the kitchen is alerted.', 'When a diet order, an allergy (recorded or reported by the patient), a meal or the menu changes, every upcoming meal is screened again. Options that no longer pass are withdrawn; chosen, confirmed or prepared meals are put on hold, cannot move forward until reviewed, and the kitchen is alerted. Replacements and cancellations are recorded so only one version is served.'],
    [Activity, 'feedback', 'Feedback', 'Ratings and refusals change future ranking, never the diet order.', 'Ratings and refusals change future ranking. Repeated refusal or low intake is flagged for professional review. Feedback never changes the diet order.'],
    [Users, 'patients', 'Patient participation', 'Patients choose, give feedback and send requests.', 'Patients with a linked account choose from approved options, update preferences and appetite, give feedback and send requests. Requests about allergies or diet go to an admin.'],
    [List, 'kitchen', 'Kitchen and delivery', 'Only confirmed meals reach the kitchen.', 'Only confirmed meals: quantities, ingredient totals in grams and tray tickets. The kitchen marks each tray prepared, then delivered. Delivered does not mean eaten: intake is recorded separately by the patient and staff.'],
    [Lock, 'accountability', 'Accountability', 'Every change is logged with who made it and when.', 'Every change to a patient’s record, schedule, intake or requests is written to an audit log with who made it and when.'],
  ];
  const howTo = {
    '@context': 'https://schema.org', '@type': 'HowTo', name: 'How CareBite supports each meal decision', url: `${SITE_URL}/how-it-works`,
    description: DESCRIPTION,
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
  };

  return (
    <>
      <JsonLd data={howTo} />
      <PageHead eyebrow="How It Works" title="How CareBite supports each meal decision">
        <p>Safety screening always comes first. Preferences and appetite only change the order of meals that already passed.</p>
      </PageHead>

      <div className="container-page flex flex-col gap-10 pb-16">
        <section aria-labelledby="jr" className="flex flex-col gap-4">
          <h2 id="jr" className="text-[1.5rem] leading-tight sm:text-[1.9rem]">Seven steps, shared by the team and the patient</h2>
          <ol aria-labelledby="jr" className="flex flex-col rounded-xl border border-border bg-card">
            {JOURNEY.map(([Icon, title, text], i) => (
              <li key={title} className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3.5 border-b border-border px-4 py-4 last:border-b-0 sm:px-5">
                <span aria-hidden className="relative grid size-11 place-items-center rounded-full bg-mint text-heading">
                  <Icon className="size-5" />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary font-display text-[.7rem] font-semibold text-primary-foreground">{i + 1}</span>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.02rem]"><span className="sr-only">Step {i + 1}: </span>{title}</h3>
                  <p className="text-[.95rem] text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-4">
          <p className="flex flex-col gap-1"><span className="eyebrow">The details</span><span className="text-muted-foreground">Open any topic to read more.</span></p>
          <div className="flex flex-col gap-3">
            <FoldOut id="order" title="In this order, every time" summary="Allergies and the diet order first, then review needs, nutrient limits, ranking and portion.">
              <p>For each patient and meal period, CareBite evaluates every dish on that day’s hospital menu, in this order:</p>
              <Pipeline steps={steps} label="Screening steps, in order" className="border-0 p-0 sm:p-0" />
              <p className="text-sm text-muted-foreground">If no meal passes for a period, the case is flagged for the nutrition team. Requirements are never relaxed automatically.</p>
            </FoldOut>
            <FoldOut id="results" title="Three possible results" summary="Passes screening, needs admin review, or excluded.">
              <CheckList>
                <CheckItem icon={Shield} title="Passes screening:">no conflict with the recorded requirements. Can be offered and confirmed by the nutrition team.</CheckItem>
                <CheckItem icon={TriangleAlert} title="Needs admin review:">information is incomplete or the diet cannot be checked automatically. Only an admin can offer or confirm it, with a review note.</CheckItem>
                <CheckItem icon={ShieldX} title="Excluded:">a certain conflict. It can never be offered or confirmed, whatever the preferences.</CheckItem>
              </CheckList>
            </FoldOut>
            <FoldOut id="statuses" title="Meal statuses" summary="One status at every step, shown to everyone in the same words.">
              <ol aria-label="Meal workflow" className="flex flex-col gap-2">
                {WORKFLOW.map((t, i) => (
                  <li key={t} className="flex items-center gap-3 rounded-[14px] border border-sage bg-mint px-4 py-2.5">
                    <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">{i + 1}</span>
                    <span className="font-display text-[.95rem] font-medium text-heading"><span className="sr-only">Step {i + 1}: </span>{t}</span>
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground">The nutrition team can also confirm a meal directly (recorded with their name). A meal can be <b className="text-heading">On hold: needs review</b> when something changes, or <b className="text-heading">Cancelled</b> (for example at discharge).</p>
            </FoldOut>
            {DETAILS.map(([Icon, id, title, summary, text]) => (
              <FoldOut key={id} id={id} title={<span className="inline-flex items-center gap-2"><Icon className="size-4 shrink-0" aria-hidden />{title}</span>} summary={summary}>
                <p>{text}</p>
              </FoldOut>
            ))}
          </div>
        </div>

        <CtaBand title="See every rule, threshold and source" action={<Link href="/diets" className={buttonVariants({ size: 'lg' })}><BookOpen aria-hidden />Diets &amp; Rules</Link>}>
          <p>Each diet category and rule is documented with its logic, its source and its review status.</p>
        </CtaBand>
      </div>
    </>
  );
}
