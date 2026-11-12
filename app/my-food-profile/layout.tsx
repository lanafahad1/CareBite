import { requirePermission } from '@/lib/server/session';

/**
 * Member space only (personal accounts outside the hospital). Checked at the layout
 * level so other roles get a real 403 response before the loading UI streams.
 */
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requirePermission('member:own', '/my-food-profile');
  return children;
}
