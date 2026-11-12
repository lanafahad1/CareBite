'use client';
import * as React from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Utensils } from 'lucide-react';
import { useApi, apiSend, apiPath, ApiError } from '@/lib/api-client';
import { PageHead, PageBody } from '@/components/site/page-head';
import { DateNav } from '@/components/cb/date-nav';
import { MealArt } from '@/components/cb/meal';
import { EmptyState } from '@/components/cb/misc';
import { Button, buttonVariants } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { LogDialog, type LogTarget } from '@/components/member/log-dialog';
import { WeekCard } from '@/components/member/week-card';
import { kcalText } from '@/components/member/meal-card';
import { formatLongDate } from '@/lib/format';
import { addDays } from '@/domain/dates.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Day = any;
type Entry = any;

function EntryRow({ e, onEdit, onDelete }: { e: Entry; onEdit: () => void; onDelete: () => void }) {
  return (
    <li className="flex items-start gap-3 rounded-[16px] border border-border bg-card p-3">
      {e.meal ? <MealArt meal={e.meal} className="aspect-[4/3] w-16 shrink-0" />
        : <span aria-hidden className="grid aspect-[4/3] w-16 shrink-0 place-items-center rounded-[14px] bg-blush text-rose-ink"><Utensils className="size-5" /></span>}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <b className="font-display font-medium leading-snug text-heading">{e.name}</b>
        <span className="text-sm text-muted-foreground">{e.periodLabel}{e.portionLabel ? ` · ${e.portionLabel.toLowerCase()} portion` : ''} · ate {e.amountLabel.toLowerCase()}</span>
        <span className="text-sm">
          <b className="text-heading">{e.kcalEaten == null ? 'No calorie data' : `${e.kcalEaten.toLocaleString('en-US')} kcal eaten`}</b>
          {e.leftoverShare > 0 ? <span className="text-muted-foreground"> · about {e.leftoverShare}% left</span> : null}
        </span>
        {e.reasonLabels.length ? <span className="text-sm text-muted-foreground">Why: {e.reasonLabels.join(', ').toLowerCase()}</span> : null}
      </div>
      <div className="flex shrink-0 flex-col">
        <button type="button" onClick={onEdit} aria-label={`Edit ${e.name}`} className="grid size-11 place-items-center rounded-full text-heading hover:bg-mint"><Pencil className="size-4" aria-hidden /></button>
        <button type="button" onClick={onDelete} aria-label={`Remove ${e.name}`} className="grid size-11 place-items-center rounded-full text-destructive hover:bg-destructive-soft"><Trash2 className="size-4" aria-hidden /></button>
      </div>
    </li>
  );
}

export function MyDayView({ initialDay, initialWeek }: { initialDay: Day; initialWeek: any }) {
  const [date, setDate] = React.useState<string>(initialDay.date);
  const today = initialDay.today;
  const dayKey = apiPath('/api/member/day', { date });
  const weekKey = apiPath('/api/member/week', { date });
  const first = date === initialDay.date;
  const { data: dayData, error, mutate: mutateDay } = useApi<Day>(dayKey, first ? initialDay : undefined);
  const { data: weekData, mutate: mutateWeek } = useApi<any>(weekKey, first ? initialWeek : undefined);
  const day = dayData ?? (first ? initialDay : null);
  const week = weekData ?? (first ? initialWeek : null);
  const [log, setLog] = React.useState<LogTarget | null>(null);
  const [remove, setRemove] = React.useState<Entry | null>(null);
  const [busy, setBusy] = React.useState(false);

  const go = (d: string) => { setDate(d); window.history.replaceState(null, '', d === today ? '/my-day' : apiPath('/my-day', { date: d })); };
  const refresh = () => Promise.all([mutateDay(), mutateWeek()]);

  async function confirmRemove() {
    if (!remove) return;
    setBusy(true);
    try {
      await apiSend('DELETE', `/api/member/log/${remove.id}`);
      setRemove(null);
      toast('Removed from your day.');
      await refresh();
    } catch (err) { toast((err as ApiError).message, { tone: 'error' }); } finally { setBusy(false); }
  }

  const t = day?.totals;
  return (
    <>
      <PageHead eyebrow="My day" title="What you ate" narrow
        actions={<Button size="lg" className="w-full md:w-auto" onClick={() => setLog({ mode: 'pick' })}><Plus aria-hidden />Add food</Button>}>
        <p>Add what you were served and how much you ate. Leftovers help us suggest the right portion next time.</p>
      </PageHead>
      <PageBody narrow>
        {week ? <WeekCard week={week} /> : null}
        <section aria-labelledby="day-h" className="flex flex-col gap-3">
          <h2 id="day-h" className="sr-only">Foods on {formatLongDate(date)}</h2>
          <DateNav date={date} onChange={go} max={today} min={addDays(today, -365)} label="Day" id="day-date" />
          {error ? <Notice tone="danger" title="We couldn’t load this day.">{error.message} Check your connection and try again.</Notice> : null}
          {!day ? <p role="status" className="text-muted-foreground">Loading…</p> : day.entries.length ? (
            <>
              <p className="text-sm" aria-live="polite">
                <b className="font-display text-base font-semibold text-heading">{t.kcalEaten == null ? 'No calorie data' : kcalText(t.kcalEaten)} eaten</b>
                {t.leftoverShare != null ? <span className="text-muted-foreground"> · about {t.leftoverShare}% left over</span> : null}
              </p>
              <ul className="flex flex-col gap-2">
                {day.entries.map((e: Entry) => <EntryRow key={e.id} e={e} onEdit={() => setLog({ mode: 'edit', entry: e })} onDelete={() => setRemove(e)} />)}
              </ul>
            </>
          ) : (
            <EmptyState title={date === today ? 'Nothing added today yet' : 'Nothing added for this day'}
              action={<Button onClick={() => setLog({ mode: 'pick' })}><Plus aria-hidden />Add food</Button>}>
              Pick a meal from the menu or add your own food with its calories. <Link href="/for-you">See meals that fit you</Link>.
            </EmptyState>
          )}
        </section>
      </PageBody>

      <LogDialog target={log} date={date} onClose={() => setLog(null)} onSaved={refresh} />
      <Dialog open={Boolean(remove)} onOpenChange={(o) => { if (!o) setRemove(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this food?</DialogTitle>
            <DialogDescription>{remove ? `${remove.name} will be removed from ${formatLongDate(remove.date)}.` : ''}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className={buttonVariants({ variant: 'outline' })}>Keep it</DialogClose>
            <Button variant="destructive" disabled={busy} onClick={confirmRemove}><Trash2 aria-hidden />{busy ? 'Removing…' : 'Remove'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
