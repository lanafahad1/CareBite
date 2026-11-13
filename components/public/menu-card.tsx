import Link from 'next/link';
import { X, TriangleAlert, Leaf, ChevronRight } from 'lucide-react';
import { MealArt } from '@/components/cb/meal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ALLERGENS, label } from '@/domain/constants.js';
import { CompatChip, type Compat } from './compat';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MenuMeal = any & { compatibility: Compat[] };

const chip = 'px-2 py-0 text-[.75rem] leading-5';
const allergen = (id: string) => label(ALLERGENS, id) as string;

/**
 * One meal on the public hospital menu, kept short: picture, name, calories,
 * cuisine and type, allergen chips, and (when filtering by a diet) that diet's fit.
 * The whole card opens the meal page, which has the ingredients, nutrition, portions,
 * every diet's fit and the sources. Phones: a compact row. Wider screens: a grid card.
 */
export function MenuMealCard({ meal, href, diet = '' }: { meal: MenuMeal; href: string; diet?: string }) {
  const kcal = meal.nutrition?.kcal as number | null | undefined;
  const partialKcal = meal.nutritionPartial?.kcal as number | null | undefined;
  const energy = kcal != null ? `${Math.round(kcal)} kcal` : partialKcal != null ? `≥${Math.round(partialKcal)} kcal` : null;
  const a = meal.allergens ?? { contains: [], mayContain: [], labelCheck: [] };
  const fit = diet ? (meal.compatibility as Compat[] | undefined)?.find((c) => c.id === diet) : null;
  return (
    <article className="relative flex min-w-0 gap-3 rounded-[18px] border border-border bg-card p-3 shadow-soft transition-colors focus-within:border-primary hover:border-primary/60 sm:flex-col sm:gap-0 sm:overflow-hidden sm:p-0">
      <MealArt meal={meal} className="size-[68px] shrink-0 sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-none" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2 sm:p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base leading-snug sm:text-lg">
            {/* Stretched link: the whole card opens the meal page. */}
            <Link href={href} className="no-underline after:absolute after:inset-0 after:rounded-[18px] after:content-[''] hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring">{meal.name}</Link>
          </h3>
          <p className="text-[.8125rem] text-muted-foreground sm:text-sm">
            <span className={energy ? 'font-semibold text-heading tabular' : undefined}>{energy ?? 'No kcal values'}</span>
            <span aria-hidden> · </span>{meal.cuisine}
            <span aria-hidden> · </span>{meal.type === 'complete' ? 'Complete meal' : 'Individual dish'}
          </p>
        </div>

        {(meal.available === false || meal.infoStatus === 'pending') ? (
          <div className="flex flex-wrap gap-1">
            {meal.available === false ? <Badge variant="danger" className={cn('whitespace-normal', chip)}><X aria-hidden />Not available now{meal.unavailableReason ? `: ${meal.unavailableReason}` : ''}</Badge> : null}
            {meal.infoStatus === 'pending' ? <Badge variant="warn" className={cn('whitespace-normal', chip)}><TriangleAlert aria-hidden />Dietary information not yet verified</Badge> : null}
          </div>
        ) : null}

        <ul aria-label="Allergens and local produce" className="flex flex-wrap gap-1">
          {a.contains.length
            ? a.contains.map((id: string) => <li key={id}><Badge variant="rose" className={chip}>{allergen(id)}</Badge></li>)
            : <li><Badge variant="ok" className={cn('whitespace-normal', chip)}>None of the 14 SFDA allergens</Badge></li>}
          {a.mayContain.length ? <li><Badge variant="outline" className={cn('whitespace-normal', chip)}>May contain {a.mayContain.map((id: string) => allergen(id).toLowerCase()).join(', ')}</Badge></li> : null}
          {meal.local?.length ? <li className="max-sm:hidden"><Badge variant="ok" className={chip}><Leaf aria-hidden />Local produce</Badge></li> : null}
        </ul>

        {/* Sits above the stretched link so it still opens its reason. */}
        {fit ? <div className="relative z-10 flex flex-wrap"><CompatChip c={fit} /></div> : null}

        <span aria-hidden className="mt-auto hidden items-center gap-1 pt-1 font-display text-sm font-semibold text-primary sm:inline-flex">Ingredients, nutrition &amp; sources<ChevronRight className="size-4" /></span>
      </div>
    </article>
  );
}
