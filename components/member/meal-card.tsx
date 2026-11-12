'use client';
// One meal on "Meals for you": a small picture, calories for the suggested portion,
// "Why this fits you" (member wording, built on the server from the engine's
// evaluation), a favourite star and "Add to my day".
import * as React from 'react';
import Link from 'next/link';
import { Star, Plus, Info, Check, Sparkles, Layers, TriangleAlert } from 'lucide-react';
import { MealArt } from '@/components/cb/meal';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { allergenName } from '@/components/cb/labels';
import { cn } from '@/lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MemberMeal = any;

export const kcalText = (n?: number | null) => (n == null ? 'No calorie data' : `${Math.round(n).toLocaleString('en-US')} kcal`);

export function FavoriteButton({ meal, busy, onToggle }: { meal: MemberMeal; busy: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} disabled={busy} aria-pressed={meal.favorite}
      aria-label={meal.favorite ? `Remove ${meal.name} from favourites` : `Add ${meal.name} to favourites`}
      className="grid size-11 shrink-0 place-items-center rounded-full text-heading hover:bg-mint disabled:opacity-50">
      <Star aria-hidden className={cn('size-5', meal.favorite && 'fill-[#E7A93B] text-[#B7791F]')} />
    </button>
  );
}

function WhyItFits({ m }: { m: MemberMeal }) {
  const review = m.status === 'review';
  return (
    <Accordion className={cn('rounded-[14px] border', review ? 'border-[#F1DFB8] bg-warning-soft/50' : 'border-sage bg-mint/60')}
      headClassName="min-h-11 px-3.5 py-2.5 font-display text-sm font-semibold text-heading"
      title={<span className="inline-flex items-center gap-2">{review ? <TriangleAlert className="size-4" aria-hidden /> : <Info className="size-4" aria-hidden />}{review ? 'What to check' : 'Why this fits you'}</span>}>
      <ul className="flex flex-col gap-1.5 px-3.5 pb-3.5 text-sm">
        {m.why.review.map((t: string, i: number) => <li key={`r${i}`} className="flex items-start gap-2"><TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" /><span>{t}</span></li>)}
        <li className="flex items-start gap-2"><Check aria-hidden className="mt-0.5 size-4 shrink-0 text-heading" /><span>{m.why.checked}</span></li>
        {m.why.reasons.map((t: string, i: number) => <li key={i} className="flex items-start gap-2"><Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-heading" /><span>{t}</span></li>)}
        {m.portion ? <li className="flex items-start gap-2"><Layers aria-hidden className="mt-0.5 size-4 shrink-0 text-heading" /><span>{m.portion.explanation}</span></li> : null}
        {m.why.notes.map((t: string, i: number) => <li key={`n${i}`} className="flex items-start gap-2"><Info aria-hidden className="mt-0.5 size-4 shrink-0 text-heading" /><span>{t}</span></li>)}
        <li className="text-xs text-muted-foreground">
          Contains: {m.allergens.contains.length ? m.allergens.contains.map(allergenName).join(', ') : 'none of the 14 SFDA allergens'}
          {m.allergens.mayContain.length ? `. May contain: ${m.allergens.mayContain.map(allergenName).join(', ')}` : ''}.
        </li>
      </ul>
    </Accordion>
  );
}

export function MemberMealCard({ m, busy, onFavorite, onAdd }: { m: MemberMeal; busy: boolean; onFavorite: () => void; onAdd: () => void }) {
  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <MealArt meal={m} className="aspect-[4/3] w-24 shrink-0 sm:w-32" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-base leading-snug"><Link href={`/meal/${m.id}`} className="no-underline hover:underline">{m.name}</Link></h3>
          <span className="text-sm text-muted-foreground">{m.cuisine}</span>
          <span className="text-sm font-semibold text-heading">{kcalText(m.nutrition.kcal)}{m.portion ? <span className="font-normal text-muted-foreground"> · {m.portion.label.toLowerCase()} portion</span> : null}</span>
        </div>
        <FavoriteButton meal={m} busy={busy} onToggle={onFavorite} />
      </div>
      <WhyItFits m={m} />
      <Button variant="outline" className="w-full sm:w-auto sm:self-start" onClick={onAdd} aria-label={`Add ${m.name} to my day`}><Plus aria-hidden />Add to my day</Button>
    </article>
  );
}
