'use client';
import * as React from 'react';
import Link from 'next/link';
import { EyeOff, TriangleAlert, Pencil, Info } from 'lucide-react';
import { useApi, apiSend, apiPath, ApiError } from '@/lib/api-client';
import { PageHead, PageBody } from '@/components/site/page-head';
import { EmptyState } from '@/components/cb/misc';
import { Accordion } from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { toast } from '@/components/ui/toast';
import { MemberMealCard, type MemberMeal } from '@/components/member/meal-card';
import { LogDialog, type LogTarget } from '@/components/member/log-dialog';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/format';
import { todayIso } from '@/domain/dates.js';
import { PERIODS } from '@/domain/constants.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Data = any;

/** Breakfast · Lunch · Dinner · Snack as a simple segmented control. */
function PeriodSwitch({ value, onChange }: { value: string; onChange: (p: string) => void }) {
  return (
    <div role="group" aria-label="Meal" className="grid grid-cols-4 gap-1 rounded-full bg-blush p-1">
      {PERIODS.map((p) => (
        <button key={p.id} type="button" aria-pressed={value === p.id} onClick={() => onChange(p.id)}
          className={cn('min-h-11 rounded-full px-2 font-display text-sm font-medium transition-colors', value === p.id ? 'bg-card text-heading shadow-soft' : 'text-muted-foreground hover:text-heading')}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function ForYouView({ initial, initialPeriod, name }: { initial: Data; initialPeriod: string; name: string }) {
  const [period, setPeriod] = React.useState(initialPeriod);
  const key = apiPath('/api/member/meals', { period });
  const { data, error, mutate } = useApi<Data>(key, period === initialPeriod ? initial : undefined);
  const d = data ?? (period === initialPeriod ? initial : null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [log, setLog] = React.useState<LogTarget | null>(null);

  const choose = (p: string) => { setPeriod(p); window.history.replaceState(null, '', apiPath('/for-you', { period: p })); };

  async function favorite(m: MemberMeal) {
    setBusy(m.id);
    try {
      await apiSend(m.favorite ? 'DELETE' : 'POST', `/api/member/favorites/${encodeURIComponent(m.id)}`);
      toast(m.favorite ? 'Removed from your favourites.' : 'Saved to your favourites.');
      await mutate();
    } catch (err) { toast((err as ApiError).message, { tone: 'error' }); } finally { setBusy(null); }
  }
  const add = (m: MemberMeal) => setLog({ mode: 'meal', meal: { id: m.id, name: m.name, category: m.category, portion: m.portion?.suggested, kcal: m.nutrition.kcal } });

  if (initial && !initial.hasProfile && !d?.hasProfile) {
    return (
      <>
        <PageHead eyebrow="Meals for you" title={`Welcome, ${name}`} narrow>
          <p>Tell us a little about your food first. Then we’ll show meals from the CareBite menu that fit you.</p>
        </PageHead>
        <PageBody narrow>
          <EmptyState title="Let’s get to know your food"
            action={<Link href="/my-food-profile" className={buttonVariants({ size: 'lg' })}>Set up my food profile</Link>}>
            Allergies, foods you like or avoid, and how hungry you usually are. It takes about two minutes.
          </EmptyState>
        </PageBody>
      </>
    );
  }

  const label = PERIODS.find((p) => p.id === period)?.label.toLowerCase() ?? period;
  return (
    <>
      <PageHead eyebrow="Meals for you" title="Meals that fit you" narrow>
        <p>From the CareBite menu, checked against your food profile. Your favourites come first.</p>
      </PageHead>
      <PageBody narrow>
        <PeriodSwitch value={period} onChange={choose} />
        {error ? <Notice tone="danger" title="We couldn’t load these meals.">{error.message} Check your connection and try again.</Notice> : null}
        {!d ? <p role="status" className="text-muted-foreground">Loading {label} ideas…</p> : (
          <>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground" aria-live="polite">
              <span><b className="text-heading">{plural(d.counts.fits, `${label} fits`, `${label} options fit`)} you</b></span>
              {d.counts.hidden ? <span className="inline-flex items-center gap-1"><EyeOff className="size-4" aria-hidden />{d.counts.hidden} hidden because of your allergies or intolerances</span> : null}
            </p>
            {d.meals.length ? (
              <div className="flex flex-col gap-3">
                {d.meals.map((m: MemberMeal) => <MemberMealCard key={m.id} m={m} busy={busy === m.id} onFavorite={() => favorite(m)} onAdd={() => add(m)} />)}
              </div>
            ) : (
              <EmptyState title={`No ${label} fits your profile yet`} art={false}
                action={<Link href="/my-food-profile" className={buttonVariants({ variant: 'outline' })}><Pencil aria-hidden />Check my food profile</Link>}>
                Try another meal of the day, or check that your allergies and intolerances are right.
              </EmptyState>
            )}
            {d.check.length ? (
              <Accordion className="rounded-[18px] border border-[#F1DFB8] bg-warning-soft/40" headClassName="min-h-12 px-4 py-3 font-display text-[.95rem] font-semibold text-heading"
                title={<span className="inline-flex items-center gap-2"><TriangleAlert className="size-4" aria-hidden />Check the ingredients yourself ({d.check.length})</span>}>
                <div className="flex flex-col gap-3 px-3 pb-3">
                  <p className="px-1 text-sm">We couldn’t fully check these against your profile. Read the ingredients before you choose one.</p>
                  {d.check.map((m: MemberMeal) => <MemberMealCard key={m.id} m={m} busy={busy === m.id} onFavorite={() => favorite(m)} onAdd={() => add(m)} />)}
                </div>
              </Accordion>
            ) : null}
            <p className="flex items-start gap-2 text-sm text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" aria-hidden /><span>{d.notice} <Link href="/my-food-profile">Edit my food profile</Link></span></p>
          </>
        )}
      </PageBody>
      <LogDialog target={log} date={todayIso()} onClose={() => setLog(null)} onSaved={() => mutate()} />
    </>
  );
}
