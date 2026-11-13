'use client';
// A titled fold-out for the public reference pages (How it works, Diets, About).
// Same look and motion as `components/ui/accordion` (t-acc classes), but the
// toggle button sits inside a real heading so the page outline stays intact,
// and a closed fold-out opens itself when the URL hash (or an in-page link)
// points at it or at anything inside it.
import * as React from 'react';
import { cn } from '@/lib/utils';

export function FoldOut({ id, title, summary, level = 2, defaultOpen = false, className, children }: {
  id?: string; title: React.ReactNode; summary?: React.ReactNode; level?: 2 | 3; defaultOpen?: boolean; className?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const ref = React.useRef<HTMLElement>(null);
  const uid = React.useId();
  const headId = id ? `${id}-h` : `${uid}-h`;
  const panelId = `${uid}-p`;
  const H = `h${level}` as 'h2' | 'h3';

  React.useEffect(() => {
    const reveal = (hash: string) => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.replace(/^#/, ''))) : null;
      const root = ref.current;
      if (!target || !root || !root.contains(target)) return;
      setOpen(true);
      // Inner targets (for example one diet inside the categories list) sit in the
      // collapsed panel, so scroll again once the panel has opened.
      if (target !== root) window.setTimeout(() => target.scrollIntoView({ block: 'start' }), 320);
    };
    reveal(window.location.hash);
    const onHash = () => reveal(window.location.hash);
    // A click on a link to the current hash fires no hashchange; catch it here.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (a) reveal(a.getAttribute('href') ?? '');
    };
    window.addEventListener('hashchange', onHash);
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('hashchange', onHash); document.removeEventListener('click', onClick); };
  }, []);

  return (
    <section ref={ref} id={id} aria-labelledby={headId} data-open={open ? 'true' : 'false'}
      className={cn('t-acc scroll-mt-24 rounded-[16px] border border-border bg-card', className)}>
      <H className="text-base">
        <button type="button" id={headId} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}
          className="t-acc-head flex min-h-14 w-full items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left sm:px-5">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-display text-[1.05rem] font-semibold leading-snug text-heading sm:text-[1.15rem]">{title}</span>
            {summary ? <span className="font-sans text-sm font-normal text-muted-foreground">{summary}</span> : null}
          </span>
          <span className="t-acc-chevron shrink-0 text-heading" aria-hidden>
            <svg viewBox="0 0 16 16" width="16" height="16"><path d="M4 6.5L8 10.5L12 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </button>
      </H>
      <div className="t-acc-panel" id={panelId} role="region" aria-labelledby={headId} inert={!open}>
        <div className="t-acc-panel-inner">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-1 sm:px-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
