import { requirePermission } from '@/lib/server/session';
import { serviceCall, getReference } from '@/lib/server/data';
import { privateMetadata } from '@/lib/seo';
import { MemberProfileView } from './member-profile-view';

export const metadata = privateMetadata('My food profile');

export default async function MyFoodProfilePage() {
  const actor = await requirePermission('member:own', '/my-food-profile');
  const initial = await serviceCall((s) => s.getMemberProfile(actor));
  const ref = await getReference();
  const reference = { allergens: ref.vocab.allergens, intolerances: ref.vocab.intolerances, cuisines: ref.vocab.cuisines, portions: ref.vocab.portions, ingredients: ref.ingredients };
  return <MemberProfileView initial={initial} reference={reference} />;
}
