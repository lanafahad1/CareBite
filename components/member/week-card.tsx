'use client';
// "Your week": calories eaten per day, estimated leftovers and the top reasons food
// was left, from the member's own diary (7 days ending on the day shown).
import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Figure, ColumnChart, niceMax } from '@/components/staff/charts';
import { formatDate } from '@/lib/format';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Week = any;

function Tile({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[14px] border border-border bg-card px-3 py-2.5">
      <b className="font-display text-xl font-semibold text-heading tabular">{value}</b>
      <small className="text-xs text-muted-foreground">{label}</small>
    </div>
  );
}

export function WeekCard({ week }: { week: Week }) {
  const days = week.days.map((d: any) => ({ ...d, label: formatDate(d.date, { weekday: 'long', month: 'short', day: 'numeric' }), short: formatDate(d.date, { weekday: 'narrow' }) }));
  const max = Math.max(0, ...days.map((d: any) => d.kcalEaten ?? 0));
  return (
    <Card tone="mint" aria-labelledby="week-h" className="gap-3">
      <CardHeader>
        <CardTitle id="week-h" className="flex items-center gap-2"><CalendarDays className="size-5" aria-hidden />Your week</CardTitle>
        <span className="text-sm text-sage-deep">{formatDate(week.from)} – {formatDate(week.to)}</span>
      </CardHeader>
      {week.daysLogged ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Tile value={week.kcalAverage == null ? '—' : week.kcalAverage.toLocaleString('en-US')} label="kcal a day (average)" />
            <Tile value={week.leftoverShare == null ? '—' : `${week.leftoverShare}%`} label="left over (estimate)" />
            <Tile value={`${week.daysLogged}/7`} label="days added" />
          </div>
          <div className="rounded-[14px] bg-card p-3">
            <Figure title="Calories eaten" caption="Per day, from how much you ate of what you were served. Days with nothing added show a dash."
              headers={['Day', 'Foods added', 'kcal eaten', 'Left over']} rows={days.map((d: any) => [d.label, d.entries, d.kcalEaten ?? '—', d.leftoverShare == null ? '—' : `${d.leftoverShare}%`])}>
              <ColumnChart unit="kcal eaten" missing="nothing added" yMax={niceMax(max, 500)} fmt={(v) => `${Math.round(v).toLocaleString('en-US')}`}
                points={days.map((d: any) => ({ label: d.label, short: d.short, value: d.entries ? d.kcalEaten : null, detail: d.entries ? `${d.leftoverShare}% left over` : undefined }))} />
            </Figure>
          </div>
          {week.reasons.length ? (
            <p className="text-sm">
              <b className="font-display font-medium text-heading">Why food was left:</b>{' '}
              {week.reasons.map((r: any) => `${r.label.toLowerCase()} (${r.count})`).join(', ')}.
              {week.reasons.some((r: any) => r.id === 'portion-too-large') ? ' We now suggest smaller portions for you.' : ''}
            </p>
          ) : <p className="text-sm text-sage-deep">No leftovers with a reason this week. Nice.</p>}
        </>
      ) : <p className="text-sm text-sage-deep">Add what you eat and your week will show up here: calories, leftovers and why food was left.</p>}
    </Card>
  );
}
