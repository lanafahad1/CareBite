import Link from 'next/link';
import { User, List, BookOpen, Target, ThumbsUp, Leaf, Lock, Shield, Database } from 'lucide-react';
import { publicMetadata } from '@/components/public/seo';
import { DEVELOPER, SITE_URL, SITE_NAME } from '@/lib/site';
import { botanical, teamPortrait } from '@/lib/art.js';
import { AboutNav } from '@/components/cb/misc';
import { Notice } from '@/components/ui/notice';
import { Band, SectionHead, CheckList, CheckItem, Panel } from '@/components/public/blocks';
import { FoldOut } from '@/components/public/fold-out';
import { Citation } from '@/components/public/citation';
import { JsonLd } from '@/components/public/json-ld';

const DESCRIPTION = 'About CareBite, a university Health Informatics project that connects structured patient information, hospital meal data and documented dietary rules to support meal decisions during a hospital stay. Meet the development team.';
export const metadata = publicMetadata({ title: 'About the Project', description: DESCRIPTION, path: '/about' });

const FLOW: [string, string, boolean?][] = [
  ['Capture', 'Coded patient records, a menu catalogue and a rule knowledge base.'],
  ['Validate', 'Server-side validation, role permissions and review flags for incomplete information.', true],
  ['Screen', 'Allergies and the diet order first, nutrient limits per portion second.', true],
  ['Support', 'Ranked, explained suggestions; the team confirms and the kitchen prepares.'],
  ['Learn', 'Intake and feedback improve future ranking and flag patients for professional review.'],
];

const initials = (n: string) => { const parts = n.split(/\s+/); return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase(); };

export default function AboutPage() {
  const ld = {
    '@context': 'https://schema.org', '@type': 'AboutPage', name: `About ${SITE_NAME}`, url: `${SITE_URL}/about`, description: DESCRIPTION,
    about: { '@id': `${SITE_URL}/#project` },
  };
  return (
    <>
      <JsonLd data={ld} />
      <AboutNav current="/about" />
      <section className="overflow-hidden bg-[radial-gradient(900px_400px_at_90%_0%,var(--cb-rose),transparent_60%),radial-gradient(700px_400px_at_0%_100%,var(--cb-mint),transparent_60%)] py-10 sm:py-14">
        <div className="container-page grid items-center gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <span className="eyebrow">Health Informatics and Project Information</span>
            <h1 className="text-[2rem] leading-tight sm:text-[2.6rem]">Connecting patient information, hospital meals and dietary rules</h1>
            <p className="text-[1.15rem]">CareBite shows how structured patient information, the hospital’s meal data and documented dietary rules can work together to support meal decisions during a hospital stay.</p>
          </div>
          <span className="mx-auto hidden w-44 sm:block sm:w-56" dangerouslySetInnerHTML={{ __html: botanical('w-full h-auto') }} />
        </div>
      </section>

      <Band tone="white" aria-labelledby="what-h" className="py-10 sm:py-14 lg:py-16">
        <div className="container-page flex flex-col gap-5">
          <h2 id="what-h" className="text-[1.6rem] leading-tight sm:text-[2rem]">What CareBite is</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Panel tone="blush">
              <h3 className="text-[1.2rem]">About CareBite</h3>
              <p>CareBite is a Health Informatics platform that helps hospital nutrition teams recommend meals that match each patient’s prescribed diet, medical restrictions, food allergies, personal preferences, and appetite. Admins define and review dietary requirements; the platform supports their decisions.</p>
            </Panel>
            <Panel tone="mint">
              <h3 className="text-[1.2rem]">Our Mission</h3>
              <p>To demonstrate how Health Informatics can connect patient health information with nutritional data to support personalized, informed dietary decision-making.</p>
            </Panel>
          </div>
          <FoldOut id="benefits" level={3} title="What CareBite is designed to support" summary="Better-matched meals, better acceptance and less avoidable waste.">
            <CheckList>
              <CheckItem icon={Target} title="Better alignment between meals and patient needs.">Every offered meal has been checked against the patient’s prescribed diet, allergies and restrictions, and portions stay within the plan.</CheckItem>
              <CheckItem icon={ThumbsUp} title="Improved meal acceptance.">Patients choose from options ranked by their own preferences and appetite, and their feedback shapes future suggestions.</CheckItem>
              <CheckItem icon={Leaf} title="Reduced avoidable waste.">Meals patients are more likely to eat, portions matched to appetite, and leftovers tracked so the team can act on patterns, supporting the national programme to reduce food loss and waste led by the General Food Security Authority (GFSA).</CheckItem>
            </CheckList>
            <Notice>These are the project’s intended benefits. This prototype uses a fictional hospital and synthetic data, so it does not measure them. Its dashboard shows indicators for review and makes no claim that the platform alone causes any change.</Notice>
          </FoldOut>
        </div>
      </Band>

      <Band aria-labelledby="built-h" className="py-10 sm:py-14 lg:py-16">
        <div className="container-page flex flex-col gap-5">
          <div className="flex max-w-3xl flex-col gap-2">
            <h2 id="built-h" className="text-[1.6rem] leading-tight sm:text-[2rem]">How it’s built</h2>
            <p className="text-muted-foreground">Each source is stored in structured, coded form in a relational database, so that the screening can be automatic, repeatable and explained.</p>
          </div>
          <div className="flex flex-col gap-3">
            <FoldOut id="sources-flow" level={3} title="From three sources to one decision" summary="Patient information, hospital meal data and documented dietary rules.">
              <CheckList>
                <CheckItem icon={User} title="Patient information:">conditions, the prescribed diet order, allergies and intolerances recorded separately, preferences and appetite, entered by the care team and the patient.</CheckItem>
                <CheckItem icon={List} title="Hospital meal data:">the menu cycle by date and meal period, recipes with ingredient weights, available portions, SFDA’s 14 declarable allergens and Saudi Food Composition Table dish values, and MEWA local-produce data.</CheckItem>
                <CheckItem icon={BookOpen} title="Documented dietary rules:">diet categories and screening rules based on Saudi government guidance (MOH, the Saudi National Diabetes Center, SFDA, MEWA and GFSA), each with its logic, threshold, source and review status.</CheckItem>
              </CheckList>
              <p className="text-sm text-muted-foreground">Coded entries, such as choosing “Sesame” from the SFDA list instead of typing it, are what make automatic screening reliable. Text that cannot be coded is kept and sent to an admin.</p>
              <ol aria-label="From capture to learning" className="flex flex-col gap-2">
                {FLOW.map(([title, text, safety], i) => (
                  <li key={title} className="flex items-start gap-3 rounded-[14px] border border-border bg-background px-3.5 py-2.5">
                    <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-semibold ${safety ? 'border-heading bg-mint text-heading' : 'border-pink bg-card text-rose-ink'}`}>{i + 1}</span>
                    <span className="min-w-0 text-[.95rem]"><b className="text-heading">{title}{safety ? <span className="sr-only"> (safety step)</span> : null}:</b> <span className="text-muted-foreground">{text}</span></span>
                  </li>
                ))}
              </ol>
            </FoldOut>
            <FoldOut id="data-model" level={3} title="Relational, coded and auditable" summary="A Postgres database of coded patient, meal and rule records.">
              <p className="break-words">Main entities in the Postgres database: Users (with roles), Patients, PatientConditions, DietOrders and DietOrderCategories, PatientAllergies (allergies and intolerances kept apart), MedicalExclusions, FoodPreferences, Meals, Ingredients, SfctDishes (SFDA), Dishes, DishIngredients, MealComponents, MenuCycle and MenuDates, LocalProduction (MEWA / GASTAT), DietCategories, MedicalDietaryRules, MealSchedule, MealOffers, ScheduleChanges and ScheduleEvents (the meal workflow and every change after an order), MealIntake (patient and staff records kept separately), PatientRequests and AuditLog.</p>
              <p className="text-sm text-muted-foreground">The coded structure could later be mapped to interoperability standards such as HL7 FHIR resources for nutrition orders, allergies and intolerances; this prototype does not exchange data with other systems.</p>
            </FoldOut>
            <FoldOut id="privacy-design" level={3} title="Minimum necessary information" summary="Privacy and safety by design: each role sees only what it needs.">
              <CheckList>
                <CheckItem icon={Lock}>Role-based access: staff cannot change clinical information or approve meals that need review, and patients see only their own.</CheckItem>
                <CheckItem icon={Shield}>Only an admin can change clinical dietary restrictions; patients send requests instead.</CheckItem>
                <CheckItem icon={Database}>Fictional demonstration identifiers (CB-####), never medical record numbers.</CheckItem>
                <CheckItem icon={List}>An audit log of every change to a patient’s record and meals.</CheckItem>
              </CheckList>
            </FoldOut>
          </div>
        </div>
      </Band>

      <Band tone="white" aria-labelledby="team-h" className="py-10 sm:py-14 lg:py-16">
        <div className="container-page">
          <SectionHead center eyebrow="Meet the developer" title="Designed with Care. Built for Better Nutrition." id="team-h" className="mb-6" />
          <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3 overflow-hidden rounded-xl border border-border bg-card px-5 pb-6 pt-7 text-center after:pointer-events-none after:absolute after:inset-x-[-30%] after:bottom-[-55%] after:h-[70%] after:bg-[radial-gradient(closest-side,var(--cb-rose),transparent)] after:opacity-70 after:content-['']">
            <span className="relative z-10 size-28 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: teamPortrait(initials(DEVELOPER.en), 0) }} />
            <h3 className="relative z-10 text-[1.15rem] font-medium">{DEVELOPER.en}</h3>
            <p className="relative z-10 text-[1.05rem] text-heading" lang="ar" dir="rtl">{DEVELOPER.ar}</p>
            <p className="relative z-10 text-sm text-muted-foreground">Website developer</p>
          </div>
          <p className="mt-7 text-center text-muted-foreground">Developed as a university Health Informatics project focused on personalized nutrition and patient-centered decision support.</p>
          <Panel className="mx-auto mt-6 max-w-3xl">
            <h3 className="text-lg">Cite this project</h3>
            <Citation id="about-cite" />
            <p className="text-sm"><Link href="/sources">All data sources and limitations</Link></p>
          </Panel>
        </div>
      </Band>
    </>
  );
}
