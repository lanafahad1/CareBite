'use client';
// Add a food to "My day" (from a menu meal, a menu search or a quick add with
// name and calories), or edit an entry. One question at a time, in plain words:
// which meal, which portion, how much you ate and, if some was left, why.
import * as React from 'react';
import { Search } from 'lucide-react';
import { useApi, apiSend, ApiError } from '@/lib/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, OptionCard } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Fieldset } from '@/components/forms/fieldset';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { formatLongDate } from '@/lib/format';
import { PERIODS, PORTIONS, MEMBER_AMOUNTS, MEMBER_REASONS } from '@/domain/constants.js';
import { kcalText } from './meal-card';

/* eslint-disable @typescript-eslint/no-explicit-any */
type MealPick = { id: string; name: string; category: string; portion?: string | null; kcal?: number | null };
export type LogTarget =
  | { mode: 'meal'; meal: MealPick }
  | { mode: 'pick' }
  | { mode: 'edit'; entry: any };

/** The meal period that fits the time of day (a default the member can change). */
export function periodNow(d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60;
  return h < 10.5 ? 'breakfast' : h < 15.5 ? 'lunch' : h < 21 ? 'dinner' : 'snack';
}

function Pills({ legend, name, options, value, onChange, error, cols = 4 }: { legend: string; name: string; options: { id: string; label: string; hint?: string }[]; value: string; onChange: (v: string) => void; error?: string; cols?: 2 | 3 | 4 }) {
  return (
    <Fieldset legend={legend}>
      <div className={cn('grid gap-2', cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
        {options.map((o) => <OptionCard key={o.id} name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} title={o.label} description={o.hint} />)}
      </div>
      {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
    </Fieldset>
  );
}

function MenuSearch({ onPick }: { onPick: (m: MealPick) => void }) {
  const { data } = useApi<any>('/api/member/meals');
  const [q, setQ] = React.useState('');
  const all: any[] = data ? [...data.meals, ...data.check] : [];
  const t = q.trim().toLowerCase();
  const hits = (t ? all.filter((m) => m.name.toLowerCase().includes(t) || m.cuisine?.toLowerCase().includes(t)) : all.filter((m) => m.favorite)).slice(0, 8);
  return (
    <div className="flex flex-col gap-2">
      <Field id="log-search" label="Find a meal from the menu">
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="For example: kabsa or lentil soup" autoComplete="off" />
      </Field>
      {!data ? <p className="text-sm text-muted-foreground">Loading the menu…</p> : (
        <div className="flex flex-col overflow-hidden rounded-[12px] border border-border bg-card" role="list" aria-label={t ? 'Matching meals' : 'Your favourite meals'}>
          {!t && !hits.length ? <p className="px-3 py-2.5 text-sm text-muted-foreground">Type a meal name, or use quick add below.</p> : null}
          {t && !hits.length ? <p className="px-3 py-2.5 text-sm text-muted-foreground">No meal matches “{q.trim()}”. Use quick add below instead.</p> : null}
          {hits.map((m) => (
            <button key={m.id} type="button" role="listitem" onClick={() => onPick({ id: m.id, name: m.name, category: m.category, portion: m.portion?.suggested, kcal: m.nutrition.kcal })}
              className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-mint focus-visible:bg-mint">
              <span className="min-w-0"><b className="font-semibold text-heading">{m.name}</b>{!t && m.favorite ? <span className="text-muted-foreground"> · favourite</span> : null}</span>
              <span className="shrink-0 text-muted-foreground">{kcalText(m.nutrition.kcal)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LogDialog({ target, date, onClose, onSaved }: { target: LogTarget | null; date: string; onClose: () => void; onSaved: () => void | Promise<unknown> }) {
  const last = React.useRef<LogTarget | null>(null);
  if (target) last.current = target;
  const t = target ?? last.current;
  const edit = t?.mode === 'edit' ? t.entry : null;

  const [meal, setMeal] = React.useState<MealPick | null>(null);
  const [quick, setQuick] = React.useState(false);
  const [name, setName] = React.useState('');
  const [kcal, setKcal] = React.useState('');
  const [period, setPeriod] = React.useState('');
  const [portion, setPortion] = React.useState('regular');
  const [amount, setAmount] = React.useState('');
  const [reasons, setReasons] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!target) return;
    setErrors({}); setFormError(null); setBusy(false);
    if (target.mode === 'edit') {
      const e = target.entry;
      setMeal(e.mealId ? { id: e.mealId, name: e.name, category: e.period } : null);
      setQuick(!e.mealId); setName(e.mealId ? '' : e.name); setKcal(e.mealId || e.kcalServed == null ? '' : String(e.kcalServed));
      setPeriod(e.period); setPortion(e.portion ?? 'regular'); setAmount(e.amount); setReasons(e.reasons ?? []);
    } else {
      const m = target.mode === 'meal' ? target.meal : null;
      setMeal(m); setQuick(false); setName(''); setKcal('');
      setPeriod(m?.category ?? periodNow()); setPortion(m?.portion ?? 'regular'); setAmount(''); setReasons([]);
    }
  }, [target]);

  const leftovers = amount && amount !== 'all';
  const reasonOptions = amount === 'all' ? MEMBER_REASONS.filter((r) => r.id === 'portion-too-small') : MEMBER_REASONS;
  const toggleReason = (id: string) => setReasons((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!edit && !meal && !quick) local.meal = 'Choose a meal from the menu, or use quick add.';
    if (quick && !name.trim()) local.name = 'Give the food a short name.';
    if (quick && (kcal.trim() === '' || !(Number(kcal) >= 0))) local.kcal = 'Enter the calories as a number.';
    if (!amount) local.amount = 'Choose how much you ate.';
    setErrors(local);
    if (Object.keys(local).length) return;
    setBusy(true); setFormError(null);
    const body: Record<string, unknown> = { period, amount, reasons: reasons.filter((r) => reasonOptions.some((o) => o.id === r)) };
    if (quick) Object.assign(body, { name: name.trim(), kcal: Number(kcal) }); else Object.assign(body, { portion, ...(edit ? {} : { mealId: meal!.id }) });
    try {
      if (edit) await apiSend('PATCH', `/api/member/log/${edit.id}`, body);
      else await apiSend('POST', '/api/member/log', { ...body, date });
      onClose();
      toast(edit ? 'Saved.' : 'Added to your day.');
      await onSaved();
    } catch (err) {
      const ae = err as ApiError;
      if (Object.keys(ae.errors ?? {}).length) setErrors(ae.errors); else setFormError(ae.message);
    } finally { setBusy(false); }
  }

  const title = edit ? 'Edit this food' : 'Add to my day';
  return (
    <Dialog open={Boolean(target)} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{edit ? `${edit.name} · ${formatLongDate(edit.date)}` : `For ${formatLongDate(date)}. It helps us suggest the right portion next time.`}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="log-form" noValidate onSubmit={submit} className="flex flex-col gap-5">
            {!edit ? (
              meal ? (
                <div className="flex items-center justify-between gap-3 rounded-[14px] border border-sage bg-mint px-3.5 py-3">
                  <span className="min-w-0"><b className="font-display font-medium text-heading">{meal.name}</b>{meal.kcal != null ? <span className="text-sm text-muted-foreground"> · {kcalText(meal.kcal)}</span> : null}</span>
                  {t?.mode === 'pick' ? <Button size="sm" variant="ghost" onClick={() => setMeal(null)}>Change</Button> : null}
                </div>
              ) : quick ? null : (
                <>
                  <MenuSearch onPick={(m) => { setMeal(m); setPeriod(m.category); setPortion(m.portion ?? 'regular'); setErrors({}); }} />
                  {errors.meal ? <p role="alert" className="text-sm font-semibold text-destructive">{errors.meal}</p> : null}
                </>
              )
            ) : null}
            {!edit && !meal ? (
              <Button variant="link" className="self-start" onClick={() => { setQuick((q) => !q); setErrors({}); }}>
                {quick ? <><Search aria-hidden />Find a meal from the menu instead</> : 'Not on the menu? Quick add with name and calories'}
              </Button>
            ) : null}
            {quick ? (
              <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                <Field id="log-name" label="What did you eat?" error={errors.name}>
                  <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="For example: chicken shawarma" autoComplete="off" />
                </Field>
                <Field id="log-kcal" label="Calories" hint="For what you were served." error={errors.kcal}>
                  <Input type="number" inputMode="numeric" min={0} max={5000} value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="kcal" />
                </Field>
              </div>
            ) : null}
            <Pills legend="Which meal?" name="log-period" options={PERIODS} value={period} onChange={setPeriod} error={errors.period} />
            {!quick && (meal || edit?.mealId) ? <Pills legend="Portion" name="log-portion" options={PORTIONS.map((p) => ({ id: p.id, label: p.label }))} value={portion} onChange={setPortion} cols={3} /> : null}
            <Pills legend="How much did you eat?" name="log-amount" options={MEMBER_AMOUNTS} value={amount} onChange={setAmount} error={errors.amount} />
            {amount ? (
              <Fieldset legend={leftovers ? 'Why was some left? (optional)' : 'Anything to tell us? (optional)'}>
                <div className="flex flex-wrap gap-2">
                  {reasonOptions.map((r) => (
                    <label key={r.id} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-mint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/25">
                      <input type="checkbox" className="size-4 accent-[var(--color-primary)]" checked={reasons.includes(r.id)} onChange={() => toggleReason(r.id)} />
                      {amount === 'all' && r.id === 'portion-too-small' ? 'It was too small' : r.label}
                    </label>
                  ))}
                </div>
              </Fieldset>
            ) : null}
            {formError ? <p role="alert" className="text-sm font-semibold text-destructive">{formError}</p> : null}
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
          <Button type="submit" form="log-form" disabled={busy}>{busy ? 'Saving…' : edit ? 'Save' : 'Add to my day'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
