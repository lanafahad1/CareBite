import { requirePermission } from '@/lib/server/session';
import { serviceCall, param } from '@/lib/server/data';
import { privateMetadata } from '@/lib/seo';
import { PERIOD_IDS } from '@/domain/constants.js';
import { ForYouView } from './for-you-view';

export const metadata = privateMetadata('Meals for you');

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The meal period that fits the time of day on the server (the member can switch). */
function periodNow(d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60;
  return h < 10.5 ? 'breakfast' : h < 15.5 ? 'lunch' : h < 21 ? 'dinner' : 'snack';
}

export default async function ForYouPage({ searchParams }: Props) {
  const actor = await requirePermission('member:own', '/for-you');
  const asked = param((await searchParams).period);
  const period = asked && (PERIOD_IDS as string[]).includes(asked) ? asked : periodNow();
  const initial = await serviceCall((s) => s.mealsForYou(actor, { period }));
  return <ForYouView initial={initial} initialPeriod={period} name={actor.name} />;
}
