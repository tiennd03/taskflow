import { TestBed } from '@angular/core/testing';
import { STORAGE_KEY, loadBoard, saveBoard } from './board.storage';
import { BoardStore } from './board.store';

describe('BoardStore', () => {
  // Each test gets a fresh TestBed, so a fresh store; storage is cleared so tests don't affect each other
  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('starts with the demo board when nothing is saved', () => {
    const store = TestBed.inject(BoardStore);
    expect(store.columns().map((c) => c.id)).toEqual(['todo', 'doing', 'review', 'done']);
    expect(store.stats().total).toBe(8);
    expect(store.stats().done).toBe(2);
    expect(store.stats().overdue).toBe(1); // the done card past its date is not counted
  });

  it('loads a saved board instead of the demo', () => {
    saveBoard({ columns: [{ id: 'only', title: 'Only', cardIds: [] }], cards: {} });
    const store = TestBed.inject(BoardStore);
    expect(store.columns().map((c) => c.title)).toEqual(['Only']);
  });

  it('adds a card to the end of a column', () => {
    const store = TestBed.inject(BoardStore);
    store.addCard('todo', { title: 'New task', description: '', priority: 'low', labels: [], dueDate: null });

    const todo = store.view().find((c) => c.id === 'todo');
    expect(todo?.cards.at(-1)?.title).toBe('New task');
    expect(store.stats().total).toBe(9);
  });

  it('filters the view without changing the board', () => {
    const store = TestBed.inject(BoardStore);
    store.setQuery('login');

    expect(store.isFiltering()).toBeTrue();
    const todo = store.view().find((c) => c.id === 'todo');
    expect(todo?.cards.map((c) => c.title)).toEqual(['Fix login redirect on refresh']);
    expect(todo?.totalCount).toBe(3);

    store.clearFilter();
    expect(store.isFiltering()).toBeFalse();
  });

  it('saves changes to localStorage', () => {
    const store = TestBed.inject(BoardStore);
    store.addColumn('Backlog');
    TestBed.tick(); // run pending effects (the save effect)

    expect(loadBoard()?.columns.at(-1)?.title).toBe('Backlog');
  });

  it('moving a card into the last column counts it as done', () => {
    const store = TestBed.inject(BoardStore);
    store.moveCard('todo', 'done', 0, 0);
    expect(store.stats().done).toBe(3);
  });
});
