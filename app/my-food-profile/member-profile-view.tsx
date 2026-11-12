'use client';
// My food profile (members): short and all self-reported. Allergies, intolerances,
// foods you like or avoid, cuisines, usual appetite and preferred portion. No diet
// orders or medical diets: CareBite does not prescribe.
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ShieldAlert, Heart, Activity, Info } from 'lucide-react';
import { useApi, apiSend, ApiError } from '@/lib/api-client';
import { PageHead, PageBody } from '@/components/site/page-head';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/field';
import { Notice } from '@/components/ui/notice';
import { toast } from '@/components/ui/toast';
import { Fieldset, Options } from '@/components/forms/fieldset';
import { IngredientPicker, TextList } from '@/components/forms/pickers';
import { FormErrors, FieldError, scrollToFirstError } from '@/components/forms/errors';
import { MEMBER_APPETITE } from '@/domain/constants.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Data = any;
type Ref = { allergens: { id: string; label: string; hint?: string }[]; intolerances: { id: string; label: string }[]; cuisines: string[]; portions: { id: string; label: string; short: string }[]; ingredients: { id: string; name: string; allergens: string[] }[] };

function Kv({ rows }: { rows: [string, string[] | string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(9rem,auto)_1fr]">
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
          <dd className="min-w-0">{Array.isArray(v) ? (v.length ? v.join(', ') : <span className="text-muted-foreground">None</span>) : v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function readForm(form: HTMLFormElement, status: string) {
  const fd = new FormData(form);
  const all = (n: string) => fd.getAll(n).map(String);
  const one = (n: string) => String(fd.get(n) ?? '');
  return {
    allergies: { status, confirmed: all('allergens'), ingredients: all('allergyIngredients'), uncoded: all('allergyText') },
    intolerances: { selected: all('intolerances'), ingredients: all('intoleranceIngredients'), uncoded: all('intoleranceText') },
    preferences: { cuisines: all('cuisines'), favorites: all('favorites'), dislikes: all('dislikes'), preferredPortion: one('preferredPortion') || 'regular' },
    appetite: one('appetite') || 'good',
  };
}

function ProfileForm({ p, reference, first, onSaved, onCancel }: { p: any; reference: Ref; first: boolean; onSaved: (d: Data) => void; onCancel?: () => void }) {
  const ref = React.useRef<HTMLFormElement>(null);
  const [status, setStatus] = React.useState<string>(first ? '' : p.allergies.status);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const ing = reference.ingredients;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({}); setFormError(null);
    if (!status) { setErrors({ 'allergies.status': 'Tell us whether you have any food allergies.' }); scrollToFirstError(ref.current); return; }
    setBusy(true);
    try {
      const res = await apiSend<Data>('PATCH', '/api/member/profile', readForm(e.currentTarget, status));
      for (const w of res.warnings ?? []) toast(w, { tone: 'warn', timeout: 9000 });
      onSaved(res);
    } catch (err) {
      const ae = err as ApiError;
      if (Object.keys(ae.errors ?? {}).length) { setErrors(ae.errors); scrollToFirstError(ref.current); } else setFormError(ae.message);
    } finally { setBusy(false); }
  }

  return (
    <FormErrors errors={errors}>
      <form ref={ref} noValidate onSubmit={submit} className="flex flex-col gap-7">
        <Fieldset legend="Do you have any food allergies?">
          <div className="grid gap-2 sm:grid-cols-2">
            <OptionCard name="allergyStatus" value="nka" checked={status === 'nka'} onChange={() => setStatus('nka')} title="No known food allergies" />
            <OptionCard name="allergyStatus" value="recorded" checked={status === 'recorded'} onChange={() => setStatus('recorded')} title="Yes, I have food allergies" />
          </div>
          <FieldError name="allergies.status" />
          {status === 'recorded' ? (
            <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-background/60 p-3">
              <span className="text-sm font-semibold text-heading">Which ones?</span>
              <Options>{reference.allergens.map((a) => <OptionCard key={a.id} type="checkbox" name="allergens" value={a.id} defaultChecked={p.allergies.confirmed.includes(a.id)} title={a.label} description={a.hint} />)}</Options>
              <span className="text-sm font-semibold text-heading">A specific food</span>
              <IngredientPicker name="allergyIngredients" initial={p.allergies.ingredients} ingredients={ing} allergens={reference.allergens} tone="danger" />
              <span className="text-sm font-semibold text-heading">Not in the list?</span>
              <TextList name="allergyText" initial={p.allergies.uncoded} placeholder="For example: kiwi" />
              <span className="text-sm text-muted-foreground">If we can’t match it to an ingredient, we’ll ask you to check those meals yourself.</span>
            </div>
          ) : null}
        </Fieldset>

        <Fieldset legend="Foods that upset you (intolerances)" hint="Optional.">
          <Options>{reference.intolerances.map((i) => <OptionCard key={i.id} type="checkbox" name="intolerances" value={i.id} defaultChecked={p.intolerances.selected.includes(i.id)} title={i.label} />)}</Options>
          <IngredientPicker name="intoleranceIngredients" initial={p.intolerances.ingredients} ingredients={ing} allergens={reference.allergens} tone="warn" />
          {p.intolerances.uncoded.map((t: string) => <input key={t} type="hidden" name="intoleranceText" value={t} />)}
        </Fieldset>

        <Fieldset legend="Foods you like" hint="Optional. Meals with these come higher up.">
          <IngredientPicker name="favorites" initial={p.preferences.favorites} ingredients={ing} allergens={reference.allergens} tone="pink" />
        </Fieldset>
        <Fieldset legend="Foods you’d rather avoid" hint="Optional. Meals with these go lower down.">
          <IngredientPicker name="dislikes" initial={p.preferences.dislikes} ingredients={ing} allergens={reference.allergens} />
        </Fieldset>

        <Fieldset legend="Cuisines you enjoy" hint="Optional.">
          <div className="flex flex-wrap gap-2">
            {reference.cuisines.map((c) => (
              <label key={c} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-mint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/25">
                <input type="checkbox" name="cuisines" value={c} defaultChecked={p.preferences.cuisines.includes(c)} className="size-4 accent-[var(--color-primary)]" />{c}
              </label>
            ))}
          </div>
        </Fieldset>

        <Fieldset legend="Your usual appetite">
          <div className="grid gap-2 sm:grid-cols-3">{MEMBER_APPETITE.map((a) => <OptionCard key={a.id} name="appetite" value={a.id} defaultChecked={p.appetite === a.id} title={a.label} description={a.id === 'good' ? 'Your preferred portion is suggested.' : 'Smaller portions are suggested.'} />)}</div>
        </Fieldset>
        <Fieldset legend="Portion you usually like">
          <div className="grid grid-cols-3 gap-2">{reference.portions.map((x) => <OptionCard key={x.id} name="preferredPortion" value={x.id} defaultChecked={p.preferences.preferredPortion === x.id} title={x.label} description={x.short} />)}</div>
        </Fieldset>

        {formError ? <p role="alert" className="text-sm font-semibold text-destructive">{formError}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel ? <Button variant="outline" onClick={onCancel}>Cancel</Button> : null}
          <Button type="submit" size="lg" disabled={busy}>{busy ? 'Saving…' : first ? 'Save and see my meals' : 'Save'}</Button>
        </div>
      </form>
    </FormErrors>
  );
}

export function MemberProfileView({ initial, reference }: { initial: Data; reference: Ref }) {
  const router = useRouter();
  const { data, mutate } = useApi<Data>('/api/member/profile', initial);
  const d = data ?? initial;
  const [editing, setEditing] = React.useState(!initial.hasProfile);
  const s = d.profile.summary;

  const saved = async (res: Data) => {
    if (!d.hasProfile) {
      toast('Saved. Here are meals that fit you.');
      router.push('/for-you');
      return;
    }
    toast('Saved. Your meals are updated.');
    await mutate(res, { revalidate: false });
    setEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHead eyebrow="Self-reported" title="My food profile" narrow
        actions={!editing ? <Button size="lg" className="w-full md:w-auto" onClick={() => setEditing(true)}><Pencil aria-hidden />Edit my profile</Button> : null}>
        <p>{d.hasProfile ? 'What you told us about your food. We use it to pick meals that fit you.' : 'A few quick questions. Everything except allergies is optional.'}</p>
      </PageHead>
      <PageBody narrow>
        <Notice tone="info" role="note" icon={<Info aria-hidden />}>{d.notice}</Notice>
        {editing ? (
          <Card>
            <ProfileForm p={d.profile} reference={reference} first={!d.hasProfile} onSaved={saved} onCancel={d.hasProfile ? () => setEditing(false) : undefined} />
          </Card>
        ) : (
          <>
            <Card aria-labelledby="mp-safe">
              <CardHeader><CardTitle id="mp-safe" className="flex items-center gap-2"><ShieldAlert className="size-5" aria-hidden />Allergies and intolerances</CardTitle></CardHeader>
              <Kv rows={[['Allergies', d.profile.allergies.status === 'nka' ? 'No known food allergies' : s.allergies], ['Intolerances', s.intolerances]]} />
              <p className="text-sm text-muted-foreground">Meals with these are hidden from Meals for you.</p>
            </Card>
            <Card aria-labelledby="mp-like">
              <CardHeader><CardTitle id="mp-like" className="flex items-center gap-2"><Heart className="size-5" aria-hidden />What you like</CardTitle></CardHeader>
              <Kv rows={[['Foods you like', s.likes], ['Foods you avoid', s.avoids], ['Cuisines', s.cuisines]]} />
            </Card>
            <Card aria-labelledby="mp-app">
              <CardHeader><CardTitle id="mp-app" className="flex items-center gap-2"><Activity className="size-5" aria-hidden />Appetite and portion</CardTitle></CardHeader>
              <Kv rows={[['Usual appetite', s.appetite], ['Preferred portion', s.portion]]} />
              <p className="text-sm text-muted-foreground">Portions are also adjusted when you tell us food was too big or too small in My day.</p>
            </Card>
          </>
        )}
      </PageBody>
    </>
  );
}
