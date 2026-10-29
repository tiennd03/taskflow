import { Priority } from '../board/board.models';

// Tailwind only generates classes it can find written out in full in the source code,
// so colours are listed as complete class strings — never built like `bg-${color}-100`.

const LABEL_COLORS = [
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
  'bg-indigo-100 text-indigo-800',
];

/** Same label → same colour every time, without storing colours anywhere. */
export function labelClass(label: string): string {
  let hash = 0;
  for (const char of label.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LABEL_COLORS[hash % LABEL_COLORS.length];
}

export const PRIORITY_CLASSES: Record<Priority, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-400',
  low: 'bg-emerald-500',
};
