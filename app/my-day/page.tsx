import { requirePermission } from '@/lib/server/session';
import { serviceCall, param } from '@/lib/server/data';
import { privateMetadata } from '@/lib/seo';
import { isoDate } from '@/lib/format';
import { MyDayView } from './my-day-view';

export const metadata = privateMetadata('My day');

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MyDayPage({ searchParams }: Props) {
  const actor = await requirePermission('member:own', '/my-day');
  const asked = isoDate(param((await searchParams).date));
  const { day, week } = await serviceCall((s) => {
    const read = (date?: string) => ({ day: s.getMemberDay(actor, { date }), week: s.getMemberWeek(actor, { date }) });
    if (!asked || asked > s.today()) return read();
    try { return read(asked); } catch { return read(); } // a deep link out of range falls back to today
  });
  return <MyDayView initialDay={day} initialWeek={week} />;
}
