export type Priority = 'high' | 'medium' | 'low';

export const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
  /** Local date as 'yyyy-MM-dd' (what <input type="date"> produces), or null. */
  dueDate: string | null;
  createdAt: number;
}

/** What the user can edit on a card. */
export type CardInput = Pick<Card, 'title' | 'description' | 'priority' | 'labels' | 'dueDate'>;

export interface Column {
  id: string;
  title: string;
  /** Card order inside the column. Cards themselves live in BoardState.cards. */
  cardIds: string[];
}

/**
 * Normalised shape: columns hold ids, cards are stored once in a lookup table.
 * Moving a card only touches two small arrays — the card object itself never changes.
 */
export interface BoardState {
  columns: Column[];
  cards: Record<string, Card>;
}

export interface BoardFilter {
  query: string;
  priority: Priority | 'all';
}

/** A column ready for display: its cards resolved and filtered. */
export interface ColumnView {
  id: string;
  title: string;
  cards: Card[];
  totalCount: number;
}
