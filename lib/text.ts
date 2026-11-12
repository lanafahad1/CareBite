// English text with {placeholders} filled in. (The site is English only; this keeps
// the account-email screens' wording in one style.)
export function t(text: string, vars?: Record<string, string | number | null | undefined>): string {
  return vars ? text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : text;
}
