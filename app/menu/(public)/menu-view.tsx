'use client';
import * as React from 'react';
import Link from 'next/link';
import { Pencil, Database, ChevronRight, Search, LayoutGrid, CalendarDays } from 'lucide-react';
import { useApi, apiPath } from '@/lib/api-client';
import { PageHead, PageBody } from '@/components/site/page-head';
import { DateNav } from '@/components/cb/date-nav';
import { EmptyState } from '@/components/cb/misc';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input, NativeSelect, Label } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { Accordion } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs';
import { MenuMealCard, type MenuMeal } from '@/components/public/menu-card';
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PERIODS } from '@/domain/constants.js';
import { ACTIVE_DIET_CATEGORIES } from '@/domain/rules.js';

export type MenuMode = 'all' | 'date';
export type MenuFilters = { view: MenuMode; date: string; period: string; q: string; diet: string; type: string };
type Period = { id: string; label: string; meals: MenuMeal[] };
type Menu = { view?: MenuMode; date: string; weekday?: string; cycleDay?: number; total?: number; nutritionNote: string; periods: Period[] };

const DIETS = (ACTIVE_DIET_CATEGORIES as { id: string; code: string; plain: string }[]).filter((d) => d.id !== 'regular');
const TABS = [{ id: 'all', label: 'All' }, ...(PERIODS as { id: string; label: string }[])];
/** Meals per meal time on the "All" tab (3 on wide screens: one row); the rest are one tap away on that meal time's tab. */
const PREVIEW = 4;
// Every meal time is loaded at once, so switching tabs is instant.
const menuKey = (f: MenuFilters) => apiPath('/api/menu', { view: f.view, date: f.view === 'date' ? f.date : '', q: f.q.trim(), diet: f.diet, type: f.type });

export function MenuView({ initial, filters: start, today, canManage }: { initial: Menu; filters: MenuFilters; today: string; canManage: boolean }) {
  const [f, setF] = React.useState<MenuFilters>(start);
  const [qInput, setQInput] = React.useState(start.q);
  const key = menuKey(f);
  const initialKey = menuKey(start);
  const { data, error, isLoading } = useApi<Menu>(key, key === initialKey ? initial : undefined);
  const m = data ?? initial;
  const byDate = (m.view ?? f.view) === 'date';
  const count = m.periods.reduce((s, p) => s + p.meals.length, 0);
  const filtered = Boolean(f.q.trim() || f.diet || f.type);
  const tab = f.period || 'all';

  const update = (next: Partial<MenuFilters>) => setF((prev) => ({ ...prev, ...next }));
  const clear = () => { setQInput(''); update({ q: '', diet: '', type: '' }); };
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const openTab = (id: string) => {
    update({ period: id === 'all' ? '' : id });
    // From "See all" further down, bring the tabs back to the top of the screen.
    requestAnimationFrame(() => { if ((tabsRef.current?.getBoundingClientRect().top ?? 0) < 0) tabsRef.current?.scrollIntoView({ block: 'start' }); });
  };

  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.history.replaceState(null, '', apiPath('/menu', {
      view: f.view === 'date' ? 'date' : '', date: f.view === 'date' && f.date !== today ? f.date : '',
      period: f.period, q: f.q.trim(), diet: f.diet, type: f.type,
    }));
  }, [f, today]);
  // Search updates after a short pause so typing stays smooth.
  React.useEffect(() => {
    const t = setTimeout(() => setF((prev) => (prev.q === qInput ? prev : { ...prev, q: qInput })), 250);
    return () => clearTimeout(t);
  }, [qInput]);

  const seg = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-display text-sm font-semibold text-heading transition-colors hover:bg-mint aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary [&_svg]:size-4';
  const href = (meal: MenuMeal, period: string) => (byDate ? apiPath(`/meal/${meal.id}`, { date: m.date, period }) : apiPath(`/meal/${meal.id}`, { period: meal.category }));

  const section = (p: Period, limit?: number) => {
    const shown = limit ? p.meals.slice(0, limit) : p.meals;
    const more = limit ? p.meals.length > limit - 1 : false;
    return (
      <section key={p.id} aria-labelledby={`mp-${p.id}`} className="flex flex-col gap-3">
        <h2 id={`mp-${p.id}`} className="flex flex-wrap items-baseline gap-x-3 border-b border-border pb-2 text-[1.3rem] sm:text-[1.5rem]">{p.label} <span className="font-sans text-sm font-normal text-muted-foreground">{plural(p.meals.length, 'meal')}</span></h2>
        {p.meals.length ? (
          <div className={cn('grid gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3', limit && 'lg:[&>*:nth-child(n+4)]:hidden')}>
            {shown.map((meal) => <MenuMealCard key={meal.id} meal={meal} diet={f.diet} href={href(meal, p.id)} />)}
          </div>
        ) : <p className="text-muted-foreground">No {p.label.toLowerCase()} meals {filtered ? 'match these filters' : 'on this menu'}.</p>}
        {more ? (
          <Button type="button" variant="outline" className="w-full sm:w-fit" onClick={() => openTab(p.id)}>
            See all {plural(p.meals.length, `${p.label.toLowerCase()} meal`)}<ChevronRight aria-hidden />
          </Button>
        ) : null}
      </section>
    );
  };

  return (
    <>
      <PageHead eyebrow="Hospital kitchen" title="Hospital Meal Menu"
        actions={canManage ? <Link href="/menu/manage" className={buttonVariants({ variant: 'outline', size: 'sm' })}><Pencil aria-hidden />Menu management</Link> : null}>
        <p>Every meal from the hospital kitchen, with its calories, allergens and the diets it fits. Tap a meal for its ingredients, nutrition and sources.</p>
      </PageHead>
      <PageBody>
        <div role="group" aria-label="Show" className="grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 shadow-soft sm:w-fit">
          <button type="button" className={seg} aria-pressed={f.view === 'all'} onClick={() => update({ view: 'all' })}><LayoutGrid aria-hidden />All meals</button>
          <button type="button" className={seg} aria-pressed={f.view === 'date'} onClick={() => update({ view: 'date' })}><CalendarDays aria-hidden />By date</button>
        </div>

        <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-3 sm:p-4">
          {f.view === 'date' ? <div className="flex flex-col gap-1.5"><span className="font-display text-sm font-medium text-heading">Menu date</span><DateNav date={f.date} onChange={(d) => update({ date: d })} id="mn-date" label="Menu date" /></div> : null}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)_minmax(0,12rem)] md:items-end">
            <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
              <Label htmlFor="mn-q" className="max-sm:sr-only">Search</Label>
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="mn-q" type="search" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search a meal, ingredient or cuisine" className="pl-9" maxLength={60} />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="mn-diet">Fits diet</Label>
              <NativeSelect id="mn-diet" value={f.diet} onChange={(e) => update({ diet: e.target.value })}>
                <option value="">Any diet</option>
                {DIETS.map((d) => <option key={d.id} value={d.id}>{d.plain} ({d.code})</option>)}
              </NativeSelect>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="mn-type">Type</Label>
              <NativeSelect id="mn-type" value={f.type} onChange={(e) => update({ type: e.target.value })}>
                <option value="">All types</option>
                <option value="complete">Complete meals</option>
                <option value="single">Individual dishes</option>
              </NativeSelect>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {isLoading ? 'Updating the menu…' : byDate ? `${plural(count, 'meal')} on the ${m.weekday} menu (cycle day ${m.cycleDay})` : `${plural(count, 'meal')} from the hospital kitchen`}
          </p>
          {filtered && count > 0 ? <Button type="button" variant="ghost" onClick={clear}>Clear filters</Button> : null}
        </div>

        {error ? <Notice tone="danger" title="We couldn’t load the menu.">{error.message} Check your connection and try again.</Notice> : null}

        {count > 0 ? (
          <Tabs value={tab} onValueChange={(v) => openTab(String(v))} className="flex flex-col gap-5">
            <div ref={tabsRef} className="scroll-mt-20">
              <TabsList aria-label="Meal time" className="w-full sm:w-auto">
                {TABS.map((t) => {
                  const n = t.id === 'all' ? count : m.periods.find((p) => p.id === t.id)?.meals.length ?? 0;
                  return (
                    <TabsTab key={t.id} value={t.id} className="h-11! flex-1 justify-center max-sm:px-1.5! max-sm:text-[.8125rem] sm:flex-none">
                      {t.label}<span className="tabular text-xs font-normal opacity-70 max-sm:hidden">{n}</span>
                    </TabsTab>
                  );
                })}
              </TabsList>
            </div>
            {TABS.map((t) => (
              <TabsPanel key={t.id} value={t.id} aria-busy={isLoading} className={cn('flex flex-col gap-8 outline-none transition-opacity', isLoading && 'opacity-60')}>
                {t.id === 'all'
                  ? m.periods.filter((p) => p.meals.length).map((p) => section(p, PREVIEW))
                  : m.periods.filter((p) => p.id === t.id).map((p) => section(p))}
              </TabsPanel>
            ))}
          </Tabs>
        ) : filtered ? (
          <EmptyState title="No meals match these filters" action={<Button type="button" onClick={clear}>Clear filters</Button>}>Try a different search, diet or type.</EmptyState>
        ) : (
          <EmptyState title="No meals on this menu" action={<Button type="button" onClick={() => update({ view: 'all' })}>See all meals</Button>}>Choose another date, or see every meal the kitchen makes.</EmptyState>
        )}

        <Accordion className="rounded-[16px] border border-border bg-card" headClassName="min-h-11 px-4 py-3 font-display text-sm font-semibold text-heading"
          title={<span className="inline-flex items-center gap-2"><Database className="size-4" aria-hidden />Sources and limitations of this information</span>}>
          <div className="flex flex-col gap-3 px-4 pb-4 text-sm">
            <ul className="flex list-disc flex-col gap-1.5 pl-5">
              <li><b>Meal types:</b> a <b>complete meal</b> combines several dishes; an <b>individual dish</b> is served on its own. “All meals” groups each meal under the meal time it is usually served at; “By date” shows that day’s menu from the 7-day cycle, with any changes for that date.</li>
              <li><b>Nutrition:</b> {m.nutritionNote} Values are per standard serving; small is ½ and large 1½ of it.</li>
              <li><b>Allergens:</b> from ingredient data, using the 14 allergens SFDA requires food services to declare (SFDA.FD 56). Packaged products vary by brand, so the kitchen checks labels.</li>
              <li><b>Halal:</b> all meat and poultry are halal-certified, as overseen by the SFDA Saudi Halal Center.</li>
              <li><b>Calories on menus:</b> SFDA requires food service menus to show calories; CareBite shows energy first wherever SFDA values exist. “≥” marks a partial total for a complete meal where one component has no SFDA values.</li>
              <li><b>Diet compatibility:</b> each meal is screened against the documented rules with default limits. “Depends on limits” means potassium and phosphorus limits are set per patient. Patient-specific screening happens on each patient’s profile.</li>
              <li><b>Texture:</b> no IDDSI texture level is recorded for menu items, so texture-modified diets always need admin review.</li>
              <li><b>Local produce:</b> marked when an ingredient group has national self-sufficiency data (MEWA, GASTAT 2024).</li>
            </ul>
            <Link href="/diets" className="inline-flex min-h-11 w-fit items-center gap-1">See every diet category, rule and source <ChevronRight className="size-4" aria-hidden /></Link>
          </div>
        </Accordion>
      </PageBody>
    </>
  );
}
