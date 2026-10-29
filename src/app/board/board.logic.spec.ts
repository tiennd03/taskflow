import {
  addCard,
  isOverdue,
  matchesFilter,
  moveCard,
  moveCardToColumn,
  parseLabels,
  removeCard,
  removeColumn,
  todayISO,
} from './board.logic';
import { BoardState, Card, CardInput } from './board.models';

const input = (title: string, extra: Partial<CardInput> = {}): CardInput => ({
  title,
  description: '',
  priority: 'medium',
  labels: [],
  dueDate: null,
  ...extra,
});

/** Two columns: a = [c1, c2, c3], b = [c4] — fixed ids make expectations easy to read. */
function fixture(): BoardState {
  let state: BoardState = {
    columns: [
      { id: 'a', title: 'A', cardIds: [] },
      { id: 'b', title: 'B', cardIds: [] },
    ],
    cards: {},
  };
  state = addCard(state, 'a', input('One'), 'c1');
  state = addCard(state, 'a', input('Two'), 'c2');
  state = addCard(state, 'a', input('Three'), 'c3');
  state = addCard(state, 'b', input('Four'), 'c4');
  return state;
}

const ids = (state: BoardState, columnId: string) => state.columns.find((c) => c.id === columnId)?.cardIds;

describe('board.logic', () => {
  describe('moveCard', () => {
    it('reorders inside the same column', () => {
      const next = moveCard(fixture(), 'a', 'a', 0, 2);
      expect(ids(next, 'a')).toEqual(['c2', 'c3', 'c1']);
    });

    it('moves a card to another column at the given index', () => {
      const next = moveCard(fixture(), 'a', 'b', 1, 0);
      expect(ids(next, 'a')).toEqual(['c1', 'c3']);
      expect(ids(next, 'b')).toEqual(['c2', 'c4']);
    });

    it('clamps an index past the end', () => {
      const next = moveCard(fixture(), 'a', 'b', 0, 99);
      expect(ids(next, 'b')).toEqual(['c4', 'c1']);
    });

    it('does not mutate the original state', () => {
      const state = fixture();
      const snapshot = JSON.stringify(state);
      moveCard(state, 'a', 'b', 0, 0);
      expect(JSON.stringify(state)).toBe(snapshot);
    });

    it('ignores unknown columns or indexes', () => {
      const state = fixture();
      expect(moveCard(state, 'x', 'b', 0, 0)).toBe(state);
      expect(moveCard(state, 'a', 'b', 10, 0)).toBe(state);
    });
  });

  it('moveCardToColumn appends to the end of the target', () => {
    const next = moveCardToColumn(fixture(), 'c1', 'b');
    expect(ids(next, 'b')).toEqual(['c4', 'c1']);
  });

  it('removeCard deletes the card and its id from the column', () => {
    const next = removeCard(fixture(), 'c2');
    expect(next.cards['c2']).toBeUndefined();
    expect(ids(next, 'a')).toEqual(['c1', 'c3']);
  });

  it('removeColumn deletes the column and all of its cards', () => {
    const next = removeColumn(fixture(), 'a');
    expect(next.columns.map((c) => c.id)).toEqual(['b']);
    expect(Object.keys(next.cards)).toEqual(['c4']);
  });

  describe('matchesFilter', () => {
    const card: Card = {
      ...input('Fix login bug', { description: 'Redirect after refresh', labels: ['Frontend'], priority: 'high' }),
      id: 'x',
      createdAt: 0,
    };

    it('matches title, description and labels, ignoring case and accents', () => {
      expect(matchesFilter(card, { query: 'LOGIN', priority: 'all' })).toBeTrue();
      expect(matchesFilter(card, { query: 'refresh', priority: 'all' })).toBeTrue();
      expect(matchesFilter(card, { query: 'fróntend', priority: 'all' })).toBeTrue();
      expect(matchesFilter(card, { query: 'payment', priority: 'all' })).toBeFalse();
    });

    it('filters by priority', () => {
      expect(matchesFilter(card, { query: '', priority: 'high' })).toBeTrue();
      expect(matchesFilter(card, { query: '', priority: 'low' })).toBeFalse();
    });
  });

  it('parseLabels trims, removes duplicates and empties', () => {
    expect(parseLabels(' bug, UI ,Bug,, ')).toEqual(['bug', 'UI']);
  });

  it('isOverdue compares local dates', () => {
    const card: Card = { ...input('x', { dueDate: '2026-10-26' }), id: 'x', createdAt: 0 };
    expect(isOverdue(card, '2026-10-27')).toBeTrue();
    expect(isOverdue(card, '2026-10-26')).toBeFalse();
    expect(isOverdue({ ...card, dueDate: null }, '2026-10-27')).toBeFalse();
  });

  it('todayISO uses the local date', () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
