import { computed, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import * as logic from './board.logic';
import { loadBoard, saveBoard } from './board.storage';
import { BoardFilter, BoardState, CardInput, ColumnView, Priority } from './board.models';

type BoardStoreState = BoardState & { filter: BoardFilter };

const initialState: BoardStoreState = {
  columns: [],
  cards: {},
  filter: { query: '', priority: 'all' },
};

/**
 * The single source of truth for the board (NgRx SignalStore).
 * - state:    columns, cards, filter
 * - computed: what the UI shows (filtered columns, stats)
 * - methods:  the only way to change state; each one delegates to a pure function in board.logic.ts
 * - hooks:    load from localStorage on start, save on every change
 */
export const BoardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ columns, cards, filter }) => ({
    isFiltering: computed(() => filter().query.trim() !== '' || filter().priority !== 'all'),

    view: computed<ColumnView[]>(() => {
      const all = cards();
      const f = filter();
      return columns().map((column) => {
        const columnCards = column.cardIds.map((id) => all[id]).filter((card) => card !== undefined);
        return {
          id: column.id,
          title: column.title,
          totalCount: columnCards.length,
          cards: columnCards.filter((card) => logic.matchesFilter(card, f)),
        };
      });
    }),

    stats: computed(() => {
      const list = columns();
      const doneColumn = list.at(-1);
      const doneIds = new Set(doneColumn?.cardIds ?? []);
      const today = logic.todayISO();
      const all = Object.values(cards());
      return {
        total: all.length,
        done: doneIds.size,
        overdue: all.filter((card) => !doneIds.has(card.id) && logic.isOverdue(card, today)).length,
      };
    }),

    /** Id of the last column — cards there count as done and are never shown as overdue. */
    doneColumnId: computed(() => columns().at(-1)?.id ?? null),
  })),

  withMethods((store) => ({
    addCard(columnId: string, input: CardInput): void {
      patchState(store, (state) => logic.addCard(state, columnId, input));
    },
    updateCard(cardId: string, changes: Partial<CardInput>): void {
      patchState(store, (state) => logic.updateCard(state, cardId, changes));
    },
    removeCard(cardId: string): void {
      patchState(store, (state) => logic.removeCard(state, cardId));
    },
    moveCard(fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number): void {
      patchState(store, (state) => logic.moveCard(state, fromColumnId, toColumnId, fromIndex, toIndex));
    },
    moveCardToColumn(cardId: string, toColumnId: string): void {
      patchState(store, (state) => logic.moveCardToColumn(state, cardId, toColumnId));
    },
    addColumn(title: string): void {
      patchState(store, (state) => logic.addColumn(state, title));
    },
    renameColumn(columnId: string, title: string): void {
      patchState(store, (state) => logic.renameColumn(state, columnId, title));
    },
    removeColumn(columnId: string): void {
      patchState(store, (state) => logic.removeColumn(state, columnId));
    },
    setQuery(query: string): void {
      patchState(store, (state) => ({ filter: { ...state.filter, query } }));
    },
    setPriority(priority: Priority | 'all'): void {
      patchState(store, (state) => ({ filter: { ...state.filter, priority } }));
    },
    clearFilter(): void {
      patchState(store, { filter: initialState.filter });
    },
    resetDemo(): void {
      patchState(store, logic.createDemoBoard(), { filter: initialState.filter });
    },
  })),

  withHooks({
    onInit(store) {
      patchState(store, loadBoard() ?? logic.createDemoBoard());

      // onInit runs in an injection context, so effect() is allowed here.
      // It re-runs whenever columns or cards change; the filter is not saved on purpose.
      effect(() => saveBoard({ columns: store.columns(), cards: store.cards() }));
    },
  }),
);
