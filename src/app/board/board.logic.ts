import { BoardFilter, BoardState, Card, CardInput, Column } from './board.models';

// Pure functions: they take a state and return a NEW state, never mutating the input.
// No Angular here, so they are trivial to unit test (see board.logic.spec.ts).

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Today in local time as 'yyyy-MM-dd'. toISOString() would give the UTC date, which is wrong after 5pm in Vietnam. */
export function todayISO(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 'yyyy-MM-dd' strings compare correctly as plain strings. */
export function isOverdue(card: Card, today: string): boolean {
  return card.dueDate !== null && card.dueDate < today;
}

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function matchesFilter(card: Card, filter: BoardFilter): boolean {
  if (filter.priority !== 'all' && card.priority !== filter.priority) return false;
  const query = normalize(filter.query);
  if (!query) return true;
  return (
    normalize(card.title).includes(query) ||
    normalize(card.description).includes(query) ||
    card.labels.some((label) => normalize(label).includes(query))
  );
}

/** "bug, UI ,bug" → ['bug', 'UI'] — trimmed, de-duplicated (case-insensitive), max 5 labels of 20 chars. */
export function parseLabels(text: string): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const raw of text.split(',')) {
    const label = raw.trim().slice(0, 20);
    const key = label.toLowerCase();
    if (label && !seen.has(key)) {
      seen.add(key);
      labels.push(label);
    }
  }
  return labels.slice(0, 5);
}

function updateColumn(state: BoardState, columnId: string, update: (column: Column) => Column): Column[] {
  return state.columns.map((column) => (column.id === columnId ? update(column) : column));
}

export function addCard(state: BoardState, columnId: string, input: CardInput, id = createId()): BoardState {
  const card: Card = { ...input, id, createdAt: Date.now() };
  return {
    cards: { ...state.cards, [id]: card },
    columns: updateColumn(state, columnId, (column) => ({ ...column, cardIds: [...column.cardIds, id] })),
  };
}

export function updateCard(state: BoardState, cardId: string, changes: Partial<CardInput>): BoardState {
  const card = state.cards[cardId];
  if (!card) return state;
  return { ...state, cards: { ...state.cards, [cardId]: { ...card, ...changes } } };
}

export function removeCard(state: BoardState, cardId: string): BoardState {
  // Destructuring with a rest object = "copy everything except this key"
  const { [cardId]: _removed, ...cards } = state.cards;
  return {
    cards,
    columns: state.columns.map((column) =>
      column.cardIds.includes(cardId)
        ? { ...column, cardIds: column.cardIds.filter((id) => id !== cardId) }
        : column,
    ),
  };
}

/** Moves a card between (or within) columns. Indexes are positions inside each column. */
export function moveCard(
  state: BoardState,
  fromColumnId: string,
  toColumnId: string,
  fromIndex: number,
  toIndex: number,
): BoardState {
  const from = state.columns.find((c) => c.id === fromColumnId);
  const to = state.columns.find((c) => c.id === toColumnId);
  if (!from || !to) return state;

  const cardId = from.cardIds[fromIndex];
  if (cardId === undefined) return state;

  const fromIds = from.cardIds.filter((_, i) => i !== fromIndex);
  const toIds = fromColumnId === toColumnId ? fromIds : [...to.cardIds];
  const clamped = Math.max(0, Math.min(toIndex, toIds.length));
  toIds.splice(clamped, 0, cardId); // safe: toIds is our own copy

  return {
    ...state,
    columns: state.columns.map((column) => {
      if (column.id === toColumnId) return { ...column, cardIds: toIds };
      if (column.id === fromColumnId) return { ...column, cardIds: fromIds };
      return column;
    }),
  };
}

/** Moves a card to the end of another column (used by the "Status" select in the edit dialog). */
export function moveCardToColumn(state: BoardState, cardId: string, toColumnId: string): BoardState {
  const from = state.columns.find((c) => c.cardIds.includes(cardId));
  const to = state.columns.find((c) => c.id === toColumnId);
  if (!from || !to || from.id === to.id) return state;
  return moveCard(state, from.id, to.id, from.cardIds.indexOf(cardId), to.cardIds.length);
}

export function addColumn(state: BoardState, title: string, id = createId()): BoardState {
  return { ...state, columns: [...state.columns, { id, title, cardIds: [] }] };
}

export function renameColumn(state: BoardState, columnId: string, title: string): BoardState {
  return { ...state, columns: updateColumn(state, columnId, (column) => ({ ...column, title })) };
}

/** Removes a column together with its cards. */
export function removeColumn(state: BoardState, columnId: string): BoardState {
  const column = state.columns.find((c) => c.id === columnId);
  if (!column) return state;
  const cards = { ...state.cards };
  for (const id of column.cardIds) delete cards[id];
  return { cards, columns: state.columns.filter((c) => c.id !== columnId) };
}

export function createDemoBoard(today = new Date()): BoardState {
  const day = (offset: number) => todayISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset));

  let state: BoardState = {
    columns: [
      { id: 'todo', title: 'To do', cardIds: [] },
      { id: 'doing', title: 'In progress', cardIds: [] },
      { id: 'review', title: 'Review', cardIds: [] },
      { id: 'done', title: 'Done', cardIds: [] },
    ],
    cards: {},
  };

  const demo: Array<[string, CardInput]> = [
    ['todo', { title: 'Design the pricing page', description: 'Three tiers, monthly/yearly toggle.', priority: 'medium', labels: ['design'], dueDate: day(5) }],
    ['todo', { title: 'Write onboarding emails', description: '', priority: 'low', labels: ['marketing'], dueDate: null }],
    ['todo', { title: 'Fix login redirect on refresh', description: 'Users land on the dashboard instead of the page they opened.', priority: 'high', labels: ['bug', 'frontend'], dueDate: day(-1) }],
    ['doing', { title: 'Build the settings screen', description: 'Profile, password, notifications.', priority: 'medium', labels: ['frontend'], dueDate: day(2) }],
    ['doing', { title: 'Set up error monitoring', description: '', priority: 'high', labels: ['devops'], dueDate: day(1) }],
    ['review', { title: 'Add dark mode', description: 'Follow the OS setting by default.', priority: 'low', labels: ['frontend', 'design'], dueDate: null }],
    ['done', { title: 'Create the project repo', description: '', priority: 'medium', labels: ['devops'], dueDate: day(-3) }],
    ['done', { title: 'Choose the UI library', description: 'Went with Tailwind CSS.', priority: 'low', labels: ['frontend'], dueDate: null }],
  ];
  for (const [columnId, input] of demo) state = addCard(state, columnId, input);
  return state;
}
