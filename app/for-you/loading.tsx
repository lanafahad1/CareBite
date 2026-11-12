import { LoadingBlock } from '@/components/ui/skeleton';

export default function Loading() {
  return <div className="container-page container-narrow py-10"><LoadingBlock label="Finding meals that fit you…" rows={4} /></div>;
}
